import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { FinanceiroService } from '../../core/services/financeiro.service';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RelatorioFinanceiro } from '../../core/models/financeiro/relatorio.model';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  accent: 'primary' | 'success' | 'warn' | 'info';
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTableModule,
    PageHeaderComponent,
  ],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
})
export class RelatoriosComponent implements OnInit {
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly relatorio = signal<RelatorioFinanceiro | null>(null);
  inicio: Date = new Date();
  fim: Date = new Date();

  readonly colunas = ['metrica', 'valor'];

  constructor() {
    this.inicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  ngOnInit() {
    this.carregarRelatorio();
  }

  carregarRelatorio() {
    this.loading.set(true);
    this.financeiroService.relatorioFinanceiro(this.toIso(this.inicio), this.toIso(this.fim)).subscribe({
      next: (data) => {
        this.relatorio.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar relatório financeiro');
        this.loading.set(false);
      },
    });
  }

  get kpis(): KpiCard[] {
    const r = this.relatorio();
    if (!r) return [];
    return [
      { label: 'Contratos fechados', value: String(r.contratosFechadosPeriodo), icon: 'fact_check', accent: 'primary' },
      { label: 'Faturamento no período', value: this.formatCurrency(r.faturamentoPeriodo), icon: 'sell', accent: 'primary' },
      { label: 'Ticket médio', value: this.formatCurrency(r.ticketMedioPeriodo), icon: 'receipt_long', accent: 'info' },
      { label: 'Caixa recebido', value: this.formatCurrency(r.caixaRecebidoPeriodo), icon: 'payments', accent: 'success' },
      { label: 'Contas vencidas', value: this.formatCurrency(r.contasVencidas), icon: 'warning_amber', accent: 'warn' },
      { label: 'Previsão (próx. mês)', value: this.formatCurrency(r.previsaoRecebimentoProximoMes), icon: 'trending_up', accent: 'info' },
    ];
  }

  get tabelaResumo(): { metrica: string; valor: string }[] {
    const r = this.relatorio();
    if (!r) return [];
    return [
      { metrica: 'Contratos válidos (ativos no total)', valor: String(r.contratosValidos) },
      { metrica: 'Contratos pendentes (parcial/vencido)', valor: String(r.contratosPendentes) },
      { metrica: 'Contas a receber', valor: this.formatCurrency(r.contasAReceber) },
      { metrica: 'Previsão de recebimento (próx. mês)', valor: this.formatCurrency(r.previsaoRecebimentoProximoMes) },
    ];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
  }

  private toIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}