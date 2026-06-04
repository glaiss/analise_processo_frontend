import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { ProcessoDetalheDTO } from '../../../core/models/processo/processo-detalhe.model';

@Component({
  selector: 'app-process-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './process-details.component.html',
  styleUrl: './process-details.component.scss'
})
export class ProcessDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private processState = inject(ProcessStateService);
  private location = inject(Location);

  numero = signal<string | null>(null);
  processo = signal<ProcessoDetalheDTO | null>(null);
  novaAnotacao = signal<string>('');
  enviandoAnotacao = signal<boolean>(false);

  timeline = computed(() => {
    const p = this.processo();
    if (!p) return [];

    const annotations = p.anotacoes.map(a => ({
      id: a.id,
      texto: a.texto,
      usuarioNome: a.usuarioNome,
      dataCriacao: a.dataCriacao,
      type: 'ANOTACAO' as const
    }));

    const contacts = p.historicoContatos.map(h => ({
      id: undefined,
      texto: h.descricao,
      usuarioNome: h.usuarioNome,
      dataCriacao: h.dataCriacao,
      type: 'CONTATO' as const
    }));

    return [...annotations, ...contacts].sort((a, b) =>
      new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    );
  });

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('numero');
    if (num) {
      this.numero.set(num);
      this.refreshDetails();
    }
  }

  refreshDetails() {
    if (this.numero()) {
      this.processState.getProcessoDetalhe(this.numero()!).subscribe(p => {
        this.processo.set(p);
      });
    }
  }

  adicionarAnotacao() {
    if (!this.novaAnotacao() || !this.numero() || this.enviandoAnotacao()) return;

    this.enviandoAnotacao.set(true);
    this.processState.adicionarAnotacao(this.numero()!, this.novaAnotacao()).subscribe({
      next: () => {
        this.novaAnotacao.set('');
        this.enviandoAnotacao.set(false);
        this.refreshDetails();
      },
      error: () => {
        this.enviandoAnotacao.set(false);
      }
    });
  }

  toggleMonitoramento() {
    if (!this.numero()) return;
    this.processState.alternarMonitoramento(this.numero()!).subscribe(() => {
      this.refreshDetails();
    });
  }

  goBack() {
    this.location.back();
  }

  getScoreColor(score: number): string {
    if (score > 100) return 'high';
    if (score > 50) return 'medium';
    return 'low';
  }

  getLevelColor(level: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (level?.toUpperCase()) {
      case 'ALTO':
      case 'INTERMEDIARIO_ALTO':
        return 'warn';
      case 'MEDIO':
        return 'accent';
      case 'INTERMEDIARIO_BAIXO':
      case 'MINIMO':
        return 'primary';
      default:
        return undefined;
    }
  }
}
