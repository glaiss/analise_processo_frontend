import { Component, Input, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, concatMap, from, map, of } from 'rxjs';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { DistributionService } from '../../../core/services/distribution.service';
import { Documento, DocumentoService } from '../../../core/services/documento.service';
import { EnriquecimentoService } from '../../../core/services/enriquecimento.service';
import { ProcessoDetalheDTO } from '../../../core/models/processo/processo-detalhe.model';
import { StatusAtribuicao } from '../../../core/models/processo/enums.model';
import { StatusDisplayPipe } from '../../../shared/pipes/status-display.pipe';
import { ScoreDisplayPipe } from '../../../shared/pipes/score-display.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../../core/models/processo';
import { SafePipe } from '../../../shared/pipes/safe.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UploadDocumentDialogComponent } from '../../../shared/components/upload-document-dialog/upload-document-dialog.component';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ContactProcessDialogComponent } from '../../../shared/components/contact-process-dialog/contact-process-dialog.component';
import { ContatoService } from '../../../core/services/contato.service';
import { ProcessoContatoDTO } from '../../../core/models/processo/processo-contato.model';

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

      MatTooltipModule,
      MatSidenavModule,
      MatDialogModule,
      MatDatepickerModule,
      MatNativeDateModule,

      SafePipe,
      LoadingOverlayComponent,
      EmptyStateComponent,
      StatusDisplayPipe,
      ScoreDisplayPipe,
    ],
  templateUrl: './process-details.component.html',
  styleUrl: './process-details.component.scss'
})
export class ProcessDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly processState = inject(ProcessStateService);
  private readonly documentoService = inject(DocumentoService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly location = inject(Location);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly enriquecimentoService = inject(EnriquecimentoService);
  private readonly contatoService = inject(ContatoService);
  private readonly distributionService = inject(DistributionService);

  readonly today = new Date();

  readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  private readonly authService = inject(AuthService);

  readonly numero = signal<string | null>(null);
  readonly processo = signal<ProcessoDetalheDTO | null>(null);
  readonly documentos = signal<Page<Documento>>({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, last: true, first: true, empty: true });
  readonly documentoSelecionado = signal<Documento | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly carregandoPreview = signal<boolean>(false);
  readonly novaAnotacao = signal<string>('');
  readonly enviandoAnotacao = signal<boolean>(false);
  readonly reprocessando = signal<boolean>(false);
  readonly contatos = signal<ProcessoContatoDTO[]>([]);
  readonly editandoContatoId = signal<string | null>(null);
  readonly editFormNome = signal<string>('');
  readonly editFormValor = signal<string>('');
  readonly salvandoContato = signal<boolean>(false);

  readonly mostrarAbaContatos = computed(() => {
    const status = this.processo()?.statusAtribuicao;
    if (!status) return false;
    return this.getCurrentStepIndex() >= 1;
  });

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('numero');
    if (num) {
      this.numero.set(num);
      this.refreshDetails();
      this.carregarDocumentos();
    }
  }

  carregarDocumentos() {
    if (this.numero()) {
      this.documentoService.listar(this.numero()!).subscribe({
        next: (docs) => {
          this.documentos.set(docs);
          if (docs.content.length > 0 && !this.documentoSelecionado()) {
            this.selecionarDocumento(docs.content[0]);
          }
        },
        error: () => {}
      });
    }
  }

  selecionarDocumento(doc: Documento) {
    this.documentoSelecionado.set(doc);
    this.gerarPreview(doc);
  }

  private gerarPreview(doc: Documento) {
    if (!this.numero() || !isPlatformBrowser(this.platformId)) return;

    this.carregandoPreview.set(true);
    this.documentoService.getPreviewUrl(this.numero()!, doc.id).subscribe({
      next: ({ url }) => {
        this.previewUrl.set(url);
        this.carregandoPreview.set(false);
      },
      error: () => {
        this.previewUrl.set(null);
        this.carregandoPreview.set(false);
        this.notification.error('Erro ao carregar pré-visualização', 3000);
      }
    });
  }

  baixarDocumento(doc: Documento) {
    this.baixarDownload(doc).subscribe({
      error: () => this.notification.error(`Erro ao baixar "${doc.nomeArquivo}"`, 3000)
    });
  }

  private baixarDownload(doc: Documento): Observable<void> {
    if (!this.numero() || !isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return this.documentoService.getDownloadUrl(this.numero()!, doc.id).pipe(
      map(({ url }) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nomeArquivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }),
      catchError(() => of(undefined))
    );
  }

  onDeleteDocument(doc: Documento) {
    if (!this.numero()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir documento',
        message: `Tem certeza que deseja excluir "${doc.nomeArquivo}"?`
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.documentoService.deletar(this.numero()!, doc.id).subscribe({
            next: () => {
              this.notification.success('Documento excluído com sucesso', 3000);
              this.documentoService.invalidatePreviewUrl(this.numero()!, doc.id);
              if (this.documentoSelecionado()?.id === doc.id) {
                this.documentoSelecionado.set(null);
                this.previewUrl.set(null);
              }
              this.carregarDocumentos();
            },
            error: () => this.notification.error('Erro ao excluir documento', 3000)
          });
        }
      },
      error: () => {}
    });
  }

  downloadTodosDocumentos() {
    this.notification.info('Iniciando download de todos os documentos...', 2000);
    const docs = this.documentos().content;
    if (docs.length === 0) return;
    from(docs).pipe(
      concatMap(doc => this.baixarDownload(doc))
    ).subscribe({
      error: () => this.notification.error('Erro ao baixar documentos', 3000)
    });
  }

  // Removido getDocumentUrl pois agora usamos previewUrl()

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.numero()) {
      const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
        data: { fileName: file.name },
        width: '500px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe({
        next: (result) => {
          const isContrato = result?.isContrato ?? false;
          this.documentoService.upload(this.numero()!, file, isContrato).subscribe({
            next: () => {
              this.notification.success('Documento enviado com sucesso', 3000);
              this.carregarDocumentos();
            },
            error: () => this.notification.error('Erro ao enviar documento', 3000)
          });
        },
        error: () => {}
      });
    }
  }

  readonly timeline = computed(() => {
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

  refreshDetails() {
    if (this.numero()) {
      this.processState.getProcessoDetalhe(this.numero()!).subscribe({
        next: (p) => {
          this.processo.set(p);
        },
        error: () => {}
      });
      this.contatoService.listar(this.numero()!).subscribe({
        next: (ctts) => this.contatos.set(ctts),
        error: () => {}
      });
    }
  }

  abrirContato(contato: ProcessoContatoDTO) {
    if (contato.tipo === 'WHATSAPP') {
      const numero = contato.valor.replace(/\D/gu, '');
      window.open(`https://wa.me/${numero}`, '_blank');
    } else if (contato.tipo === 'EMAIL') {
      window.open(`mailto:${contato.valor}`, '_blank');
    }
  }

  formatContatoValor(contato: ProcessoContatoDTO): string {
    if (contato.tipo === 'EMAIL') return contato.valor;
    const digits = contato.valor.replace(/\D/gu, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return contato.valor;
  }

  deletarContato(contato: ProcessoContatoDTO) {
    if (!this.numero()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir contato',
        message: `Tem certeza que deseja excluir o contato "${contato.nome || contato.valor}"?`
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (!result) return;

        this.contatoService.deletar(this.numero()!, contato.id).subscribe({
          next: () => {
            this.notification.success('Contato excluído com sucesso', 3000);
            this.carregarContatos();
          },
          error: () => this.notification.error('Erro ao excluir contato', 3000)
        });
      },
      error: () => {}
    });
  }

  definirComoPrincipal(contato: ProcessoContatoDTO) {
    if (!this.numero()) return;
    this.contatoService.atualizar(this.numero()!, contato.id, {
      tipo: contato.tipo,
      valor: contato.valor,
      nome: contato.nome,
      principal: true
    }).subscribe({
      next: () => {
        this.notification.success('Contato definido como principal', 3000);
        this.carregarContatos();
      },
      error: () => this.notification.error('Erro ao definir contato como principal', 3000)
    });
  }

  startEditContato(contato: ProcessoContatoDTO) {
    this.editandoContatoId.set(contato.id);
    this.editFormNome.set(contato.nome);
    this.editFormValor.set(contato.valor);
  }

  cancelEditContato() {
    this.editandoContatoId.set(null);
    this.editFormNome.set('');
    this.editFormValor.set('');
  }

  adicionarContato() {
    const dialogRef = this.dialog.open(ContactProcessDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { numero: this.numero() }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (!result || !this.numero()) return;

        this.salvandoContato.set(true);
        this.contatoService.salvar(this.numero()!, {
          tipo: result.tipo,
          valor: result.valor,
          nome: result.nome ?? undefined,
          principal: result.principal
        }).subscribe({
          next: () => {
            this.notification.success('Contato adicionado com sucesso', 3000);
            this.carregarContatos();
            this.salvandoContato.set(false);
          },
          error: () => {
            this.notification.error('Erro ao adicionar contato', 3000);
            this.salvandoContato.set(false);
          }
        });
      },
      error: () => {}
    });
  }

  salvarEditContato(contato: ProcessoContatoDTO) {
    const nome = this.editFormNome().trim();
    const valor = this.editFormValor().trim();
    if (!nome || !valor) return;

    this.salvandoContato.set(true);
    this.contatoService.atualizar(this.numero()!, contato.id, {
      tipo: contato.tipo,
      valor,
      nome,
    }).subscribe({
      next: () => {
        this.notification.success('Contato atualizado com sucesso', 3000);
        this.cancelEditContato();
        this.carregarContatos();
      },
      error: () => {
        this.notification.error('Erro ao atualizar contato', 3000);
        this.salvandoContato.set(false);
      }
    });
  }

  private carregarContatos() {
    if (this.numero()) {
      this.contatoService.listar(this.numero()!).subscribe({
        next: (ctts) => this.contatos.set(ctts),
        error: () => {}
      });
    }
  }

  onRetryDetails() {
    this.refreshDetails();
  }

  deletarAnotacao(anotacaoId: string | undefined) {
    if (!anotacaoId || !this.numero()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir anotação',
        message: 'Tem certeza que deseja excluir esta anotação?'
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.processState.deletarAnotacao(this.numero()!, anotacaoId).subscribe({
            next: () => {
              this.notification.success('Anotação excluída com sucesso', 3000);
              this.refreshDetails();
            },
            error: () => this.notification.error('Erro ao excluir anotação', 3000)
          });
        }
      },
      error: () => {}
    });
  }

  onRetryDocumentos() {
    this.carregarDocumentos();
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
    this.processState.alternarMonitoramento(this.numero()!).subscribe({
      next: () => {
        this.refreshDetails();
      },
      error: () => {}
    });
  }

  onDiscard() {
    if (!this.numero()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar descarte',
        message: 'Tem certeza que deseja descartar este processo?'
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.processState.discardProcess(this.numero()!).subscribe({
            next: () => {
              this.notification.success('Processo descartado com sucesso', 3000);
              this.goBack();
            },
            error: () => this.notification.error('Erro ao descartar processo', 3000)
          });
        }
      },
      error: () => {}
    });
  }

  goBack() {
    this.location.back();
  }

  reprocessar() {
    const numero = this.numero();
    if (!numero) return;

    this.reprocessando.set(true);
    this.enriquecimentoService.reprocessarPorNumeros([numero]).subscribe({
      next: (response) => {
        const result = response.resultados[0];
        if (result?.sucesso) {
          this.notification.success(`Processo enviado para scraping`, 5000);
        } else {
          this.notification.warn(`Processo enviado, mas pode haver falhas`, 5000);
        }
        this.reprocessando.set(false);
      },
      error: () => {
        this.notification.error('Erro ao enviar processo para scraping', 5000);
        this.reprocessando.set(false);
      }
    });
  }

  copyProcessNumber() {
    const numero = this.processo()?.numero;
    if (numero) {
      void navigator.clipboard.writeText(numero).then(() => {
        this.notification.success('Número do processo copiado!', 2000);
      });
    }
  }

  get prazoDisplayText(): string {
    const p = this.processo();
    if (!p?.prazoFinal) return '';
    if (p.statusPrazo === 'CUMPRIDO') return 'Cumprido';
    const dias = p.diasPendentes;
    if (dias === null || dias === undefined) return '';
    if (dias < 0) return `${-dias} dia(s) em atraso`;
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence em 1 dia';
    return `Vence em ${dias} dias`;
  }

  get prazoDaysColor(): string {
    const p = this.processo();
    if (p?.statusPrazo === 'CUMPRIDO') return 'success';
    const dias = p?.diasPendentes;
    if (dias === null || dias === undefined) return 'neutral';
    if (dias <= 1) return 'warn';
    if (dias === 2) return 'accent';
    return 'neutral';
  }

  get prazoFinalLabel(): string {
    const p = this.processo();
    if (!p?.prazoFinal) return '';
    const datePart = p.prazoFinal.substring(0, 10).split('-');
    if (datePart.length !== 3) return p.prazoFinal;
    return `${datePart[2]}/${datePart[1]}/${datePart[0]}`;
  }

  onPrazoDateChange(value: Date | null) {
    const p = this.processo();
    if (!value || !p?.atribuicaoId) return;
    this.distributionService.definirPrazo(p.atribuicaoId, this.toIso(value)).subscribe({
      next: () => {
        this.notification.success('Prazo definido com sucesso!');
        this.refreshDetails();
      },
      error: () => this.notification.error('Erro ao definir prazo', 3000),
    });
  }

  private toIso(date: Date): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  fecharContrato() {
    const numero = this.processo()?.numero;
    if (numero) {
      void this.router.navigate(['/financeiro/contratos/novo', numero]);
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  }

  getDocIcon(contentType: string): string {
    if (contentType.includes('pdf')) return 'picture_as_pdf';
    if (contentType.includes('image')) return 'image';
    if (contentType.includes('word') || contentType.includes('document')) return 'article';
    if (contentType.includes('spreadsheet') || contentType.includes('excel') || contentType.includes('sheet')) return 'table_chart';
    if (contentType.includes('text') || contentType.includes('plain')) return 'text_snippet';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes  } B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)  } KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)  } MB`;
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

  // Flow stepper
  readonly FLOW_STEPS = [
    { status: StatusAtribuicao.ATRIBUIDO, label: 'Atribuído', icon: 'assignment_ind' },
    { status: StatusAtribuicao.EM_CONVERSA, label: 'Em Conversa', icon: 'phone_in_talk' },
    { status: StatusAtribuicao.EM_NEGOCIACAO, label: 'Em Negociação', icon: 'handshake' },
    { status: StatusAtribuicao.CONCLUIDO_SUCESSO, label: 'Positivo', icon: 'check_circle' },
    { status: StatusAtribuicao.CONCLUIDO_RECUSADO, label: 'Negativo', icon: 'cancel' },
  ];

  getCurrentStepIndex(): number {
    const current = this.processo()?.statusAtribuicao;
    if (!current) return -1;
    return this.FLOW_STEPS.findIndex(s => s.status === current);
  }

  isStepCompleted(index: number): boolean {
    const currentIdx = this.getCurrentStepIndex();
    if (currentIdx < 0) return false;
    if (currentIdx === 4) return false;
    if (currentIdx === 3 && index === 4) return false;
    return index <= currentIdx;
  }

  isStepCurrent(index: number): boolean {
    return index === this.getCurrentStepIndex();
  }

  isConnectorActive(beforeIdx: number): boolean {
    if (!this.isStepCompleted(beforeIdx)) return false;
    if (beforeIdx === 3) return false;
    return true;
  }

  isStepAvailable(index: number): boolean {
    const current = this.processo()?.statusAtribuicao;
    if (!current) return false;
    const currentIdx = this.getCurrentStepIndex();
    if (currentIdx < 0) return false;
    if (currentIdx === 0 && index === 1) return true;
    if (currentIdx === 1 && index === 2) return true;
    if (currentIdx === 2 && (index === 3 || index === 4)) return true;
    if (currentIdx === 4 && index === 3) return true;
    return false;
  }

  isTerminalStatus(): boolean {
    const s = this.processo()?.statusAtribuicao;
    return s === StatusAtribuicao.CONCLUIDO_SUCESSO || s === StatusAtribuicao.CONCLUIDO_RECUSADO;
  }

  avancarStatus(stepIndex: number) {
    const numero = this.numero();
    const step = this.FLOW_STEPS[stepIndex];
    if (!numero || !step) return;

    const currentIdx = this.getCurrentStepIndex();

    if (currentIdx === 0 && stepIndex === 1) {
      const dialogRef = this.dialog.open(ContactProcessDialogComponent, {
        width: '480px',
        disableClose: true,
        data: { numero }
      });

      dialogRef.afterClosed().subscribe({
        next: (result) => {
          if (!result) return;

          this.contatoService.salvar(numero, {
            tipo: result.tipo,
            valor: result.valor,
            nome: result.nome ?? undefined,
            principal: true
          }).subscribe({
            next: () => {
              this.processState.atualizarStatus(numero, step.status).subscribe({
                next: () => this.refreshDetails(),
                error: () => this.notification.error('Erro ao atualizar status do processo')
              });
            },
            error: () => this.notification.error('Erro ao salvar contato')
          });
        }
      });
      return;
    }

    this.processState.atualizarStatus(numero, step.status).subscribe({
      next: () => {
        this.refreshDetails();
      },
      error: () => {
        this.notification.error('Erro ao atualizar status do processo');
      }
    });
  }
}
