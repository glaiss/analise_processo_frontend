import { Component, inject, OnInit, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { Documento, DocumentoService } from '../../../core/services/documento.service';
import { EnriquecimentoService } from '../../../core/services/enriquecimento.service';
import { ProcessoDetalheDTO } from '../../../core/models/processo/processo-detalhe.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../../core/models/processo';
import { SafePipe } from '../../../shared/pipes/safe.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UploadDocumentDialogComponent } from '../../../shared/components/upload-document-dialog/upload-document-dialog.component';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

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

      SafePipe,
      LoadingOverlayComponent,
      EmptyStateComponent
    ],
  templateUrl: './process-details.component.html',
  styleUrl: './process-details.component.scss'
})
export class ProcessDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private processState = inject(ProcessStateService);
  private documentoService = inject(DocumentoService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private location = inject(Location);
  private platformId = inject(PLATFORM_ID);
  private enriquecimentoService = inject(EnriquecimentoService);

  numero = signal<string | null>(null);
  processo = signal<ProcessoDetalheDTO | null>(null);
  documentos = signal<Page<Documento>>({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, last: true, first: true, empty: true });
  documentoSelecionado = signal<Documento | null>(null);
  previewUrl = signal<string | null>(null);
  carregandoPreview = signal<boolean>(false);
  novaAnotacao = signal<string>('');
  enviandoAnotacao = signal<boolean>(false);
  reprocessando = signal<boolean>(false);

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
    if (this.previewUrl()) {
      window.URL.revokeObjectURL(this.previewUrl()!);
    }

    this.documentoService.download(this.numero()!, doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
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
    if (this.numero() && isPlatformBrowser(this.platformId)) {
      this.documentoService.download(this.numero()!, doc.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.nomeArquivo;
          a.click();
          if (url !== this.previewUrl()) {
            window.URL.revokeObjectURL(url);
          }
        },
        error: () => {}
      });
    }
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
    this.documentos().content.forEach(doc => this.baixarDocumento(doc));
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

  refreshDetails() {
    if (this.numero()) {
      this.processState.getProcessoDetalhe(this.numero()!).subscribe({
        next: (p) => {
          this.processo.set(p);
        },
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
      navigator.clipboard.writeText(numero).then(() => {
        this.notification.success('Número do processo copiado!', 2000);
      });
    }
  }

  getScoreColor(score: number): string {
    if (score > 100) return 'high';
    if (score > 50) return 'medium';
    return 'low';
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
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
