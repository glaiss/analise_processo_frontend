import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AcompanhamentoService } from '../../core/services/acompanhamento.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  OabEquipeResponse,
  ProcessoAcompanhadoResumoDTO,
} from '../../core/models/acompanhamento/acompanhamento.model';
import {
  FONTES_ACOMPANHAMENTO,
  FonteAcompanhamento,
  fonteLabel,
} from '../../core/models/acompanhamento/fonte-acompanhamento';
import { Page } from '../../core/models/processo/pagination.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { statusColor, statusLabel } from '../../core/utils/acompanhamento-status.util';

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './acompanhamento.component.html',
  styleUrl: './acompanhamento.component.scss',
})
export class AcompanhamentoComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly acompanhamentoService = inject(AcompanhamentoService);

  readonly ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  readonly oabForm = this.fb.group({
    numero: ['', [Validators.required, Validators.pattern(/^\d{1,7}$/u)]],
    uf: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/u)]],
  });

  readonly fontesOpcoes = FONTES_ACOMPANHAMENTO;
  readonly fonteLabel = fonteLabel;
  readonly fontesSelecionadas = signal<FonteAcompanhamento[]>(
    FONTES_ACOMPANHAMENTO.map((fonte) => fonte.valor),
  );

  readonly equipe = signal<OabEquipeResponse | null>(null);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly sincronizando = signal(false);

  readonly processos = signal<ProcessoAcompanhadoResumoDTO[]>([]);
  readonly carregandoProcessos = signal(false);
  readonly totalProcessos = signal(0);
  readonly ultimaPagina = signal(true);
  readonly filtroNumero = signal('');
  readonly filtroStatus = signal('');

  readonly statusLabel = statusLabel;
  readonly statusColor = statusColor;

  readonly membroAtual = computed(
    () => this.equipe()?.membros.find((membro) => membro.usuarioAtual) ?? null,
  );
  readonly usuarioAtualTemOab = computed(() => this.equipe()?.usuarioAtualTemOab ?? false);
  readonly todosComOab = computed(() => this.equipe()?.todosComOab ?? false);
  readonly membrosPendentes = computed(
    () => this.equipe()?.membros.filter((membro) => !membro.temOab || !membro.ativo) ?? [],
  );

  private paginaAtual = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.carregarEquipe();
    this.carregarProcessos(true);
  }

  ngOnDestroy() {
    this.pararPolling();
  }

  carregarEquipe() {
    this.carregando.set(true);
    this.acompanhamentoService.obterOabEquipe().subscribe({
      next: (equipe) => {
        this.equipe.set(equipe);
        const atual = equipe.membros.find((membro) => membro.usuarioAtual);
        if (atual?.oabNumero) {
          this.oabForm.patchValue({ numero: atual.oabNumero, uf: atual.oabUf ?? '' });
        }
        if (atual?.fontes?.length) {
          this.fontesSelecionadas.set(atual.fontes);
        }
        if (atual?.ultimoStatus === 'EM_ANDAMENTO') {
          this.iniciarPolling();
        }
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.notification.error('Erro ao carregar dados do acompanhamento');
      },
    });
  }

  isFonteSelecionada(fonte: FonteAcompanhamento): boolean {
    return this.fontesSelecionadas().includes(fonte);
  }

  alternarFonte(fonte: FonteAcompanhamento, marcada: boolean) {
    this.fontesSelecionadas.update((atuais) => {
      const selecionadas = new Set(atuais);
      if (marcada) {
        selecionadas.add(fonte);
      } else {
        selecionadas.delete(fonte);
      }
      return this.fontesOpcoes
        .filter((opcao) => selecionadas.has(opcao.valor))
        .map((opcao) => opcao.valor);
    });
  }

  salvarOab() {
    if (this.oabForm.invalid || this.fontesSelecionadas().length === 0) {
      this.oabForm.markAllAsTouched();
      if (this.fontesSelecionadas().length === 0) {
        this.notification.error('Selecione ao menos um site de consulta');
      }
      return;
    }

    const { numero, uf } = this.oabForm.getRawValue();
    this.salvando.set(true);
    this.acompanhamentoService
      .salvarOab({
        numero: numero!.trim(),
        uf: uf!.trim().toUpperCase(),
        fontes: this.fontesSelecionadas(),
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.notification.success('OAB salva. Sincronizando processos...');
          this.carregarEquipe();
          this.iniciarPolling();
        },
        error: () => {
          this.salvando.set(false);
          this.notification.error('Erro ao salvar OAB');
        },
      });
  }

  sincronizarAgora() {
    this.sincronizando.set(true);
    this.acompanhamentoService.sincronizar().subscribe({
      next: () => {
        this.notification.info('Sincronização solicitada');
        this.iniciarPolling();
      },
      error: () => {
        this.sincronizando.set(false);
        this.notification.error('Erro ao solicitar sincronização');
      },
    });
  }

  desativarOab() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desativar OAB',
        message: 'Deseja desativar sua OAB do acompanhamento? Os processos vinculados serão desvinculados.',
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (confirmado) => {
        if (!confirmado) return;
        this.acompanhamentoService.desativarOab().subscribe({
          next: () => {
            this.notification.success('OAB desativada');
            this.oabForm.reset();
            this.fontesSelecionadas.set(FONTES_ACOMPANHAMENTO.map((fonte) => fonte.valor));
            this.carregarEquipe();
            this.carregarProcessos(true);
          },
          error: () => this.notification.error('Erro ao desativar OAB'),
        });
      },
    });
  }

  aplicarFiltros() {
    this.carregarProcessos(true);
  }

  atualizarFiltroNumero(event: Event) {
    this.filtroNumero.set((event.target as HTMLInputElement).value);
  }

  limparFiltros() {
    this.filtroNumero.set('');
    this.filtroStatus.set('');
    this.carregarProcessos(true);
  }

  carregarMais() {
    this.carregarProcessos(false);
  }

  abrirProcesso(numero: string) {
    void this.router.navigate(['/acompanhamento/processos', numero]);
  }

  private carregarProcessos(reset: boolean) {
    if (!reset && (this.carregandoProcessos() || this.ultimaPagina())) {
      return;
    }
    if (reset) {
      this.paginaAtual = 0;
      this.ultimaPagina.set(false);
    }

    this.carregandoProcessos.set(true);
    this.acompanhamentoService
      .listarProcessos(this.paginaAtual, 20, {
        numero: this.filtroNumero().trim() || undefined,
        status: this.filtroStatus() || undefined,
      })
      .subscribe({
        next: (page: Page<ProcessoAcompanhadoResumoDTO>) => {
          this.processos.set(reset ? page.content : [...this.processos(), ...page.content]);
          this.totalProcessos.set(page.totalElements);
          this.ultimaPagina.set(page.last);
          this.paginaAtual++;
          this.carregandoProcessos.set(false);
        },
        error: () => {
          this.carregandoProcessos.set(false);
          this.notification.error('Erro ao carregar processos');
        },
      });
  }

  private iniciarPolling() {
    this.pararPolling();
    this.sincronizando.set(true);
    this.tentarStatus(40);
  }

  private tentarStatus(tentativasRestantes: number) {
    this.acompanhamentoService.obterStatus().subscribe({
      next: (status) => {
        this.atualizarStatusAtual(status.status, status.ultimaSincronizacaoEm, status.ultimoErro);
        const emAndamento = status.status === 'EM_ANDAMENTO';

        if (emAndamento && tentativasRestantes > 0) {
          this.pollTimer = setTimeout(() => this.tentarStatus(tentativasRestantes - 1), 3000);
          return;
        }

        this.sincronizando.set(false);
        if (status.status === 'ERRO') {
          this.notification.error('Falha na sincronização da OAB');
        } else if (!emAndamento) {
          this.notification.success('Sincronização concluída');
          this.carregarProcessos(true);
        }
        this.carregarEquipe();
      },
      error: () => {
        if (tentativasRestantes > 0) {
          this.pollTimer = setTimeout(() => this.tentarStatus(tentativasRestantes - 1), 5000);
          return;
        }
        this.sincronizando.set(false);
      },
    });
  }

  private atualizarStatusAtual(
    status: string | null,
    ultimaSincronizacaoEm: string | null,
    ultimoErro: string | null,
  ) {
    this.equipe.update((equipe) => {
      if (!equipe) return equipe;
      return {
        ...equipe,
        membros: equipe.membros.map((membro) =>
          membro.usuarioAtual
            ? {
                ...membro,
                temOab: true,
                ativo: true,
                ultimoStatus: status,
                ultimaSincronizacaoEm,
                ultimoErro,
              }
            : membro,
        ),
      };
    });
  }

  private pararPolling() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
