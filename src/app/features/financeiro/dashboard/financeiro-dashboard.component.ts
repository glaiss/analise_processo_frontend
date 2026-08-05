import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { IndicadoresFinanceiros } from '../../../core/models/financeiro/indicadores.model';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  accent: 'primary' | 'success' | 'warn' | 'info';
}

@Component({
  selector: 'app-financeiro-dashboard',
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
    PageHeaderComponent,
  ],
  templateUrl: './financeiro-dashboard.component.html',
  styleUrl: './financeiro-dashboard.component.scss',
})
export class FinanceiroDashboardComponent implements OnInit {
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly indicadores = signal<IndicadoresFinanceiros | null>(null);
  inicio: Date = new Date();
  fim: Date = new Date();

  constructor() {
    this.inicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  ngOnInit() {
    this.carregarIndicadores();
  }

  carregarIndicadores() {
    this.loading.set(true);
    this.financeiroService.indicadores(this.toIso(this.inicio), this.toIso(this.fim)).subscribe({
      next: (data) => {
        this.indicadores.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar indicadores financeiros');
        this.loading.set(false);
      },
    });
  }

  get kpis(): KpiCard[] {
    const ind = this.indicadores();
    if (!ind) return [];
    return [
      { label: 'Faturamento no período', value: this.formatCurrency(ind.faturamentoPeriodo), icon: 'sell', accent: 'primary' },
      { label: 'Caixa recebido', value: this.formatCurrency(ind.caixaRecebidoPeriodo), icon: 'payments', accent: 'success' },
      { label: 'Contas a receber', value: this.formatCurrency(ind.contasAReceber), icon: 'schedule', accent: 'info' },
      { label: 'Contas vencidas', value: this.formatCurrency(ind.contasVencidas), icon: 'warning_amber', accent: 'warn' },
      { label: 'Previsão (próx. mês)', value: this.formatCurrency(ind.previsaoRecebimentoProximoMes), icon: 'trending_up', accent: 'info' },
    ];
  }

  get exibirAlertaVencidas(): boolean {
    const vencidas = this.indicadores()?.contasVencidas ?? 0;
    return vencidas > 0;
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

  novoContrato() {
    void this.router.navigate(['/financeiro/contratos/novo']);
  }

  listarContratos() {
    void this.router.navigate(['/financeiro/contratos']);
  }
}