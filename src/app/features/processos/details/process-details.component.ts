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
import { MatSidenavModule } from '@angular/material/sidenav';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { Documento, DocumentoService } from '../../../core/services/documento.service';
import { ProcessoDetalheDTO } from '../../../core/models/processo/processo-detalhe.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Page } from '../../../core/models/processo';
import { SafePipe } from '../../../shared/pipes/safe.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UploadDocumentDialogComponent } from '../../../shared/components/upload-document-dialog/upload-document-dialog.component';

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
      UploadDocumentDialogComponent,

      SafePipe
    ],
  templateUrl: './process-details.component.html',
  styleUrl: './process-details.component.scss'
})
export class ProcessDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private processState = inject(ProcessStateService);
  private documentoService = inject(DocumentoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private location = inject(Location);

  numero = signal<string | null>(null);
  processo = signal<ProcessoDetalheDTO | null>(null);
  documentos = signal<Page<Documento>>({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, last: true, first: true, empty: true });
  documentoSelecionado = signal<Documento | null>(null);
  previewUrl = signal<string | null>(null);
  carregandoPreview = signal<boolean>(false);
  novaAnotacao = signal<string>('');
  enviandoAnotacao = signal<boolean>(false);

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
      this.documentoService.listar(this.numero()!).subscribe(docs => {
        this.documentos.set(docs);
        if (docs.content.length > 0 && !this.documentoSelecionado()) {
          this.selecionarDocumento(docs.content[0]);
        }
      });
    }
  }

  selecionarDocumento(doc: Documento) {
    this.documentoSelecionado.set(doc);
    this.gerarPreview(doc);
  }

  private gerarPreview(doc: Documento) {
    if (!this.numero()) return;

    this.carregandoPreview.set(true);
    // Revogar URL anterior para evitar vazamento de memória
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
        this.snackBar.open('Erro ao carregar pré-visualização', 'Fechar', { duration: 3000 });
      }
    });
  }

  baixarDocumento(doc: Documento) {
    if (this.numero()) {
      this.documentoService.download(this.numero()!, doc.id).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nomeArquivo;
        a.click();
        // Não revogamos aqui se for o mesmo do preview, 
        // mas para download pontual é seguro revogar após o click se não for o atual
        if (url !== this.previewUrl()) {
          window.URL.revokeObjectURL(url);
        }
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentoService.deletar(this.numero()!, doc.id).subscribe({
          next: () => {
            this.snackBar.open('Documento excluído com sucesso', 'Fechar', { duration: 3000 });
            if (this.documentoSelecionado()?.id === doc.id) {
              this.documentoSelecionado.set(null);
              this.previewUrl.set(null);
            }
            this.carregarDocumentos();
          },
          error: () => this.snackBar.open('Erro ao excluir documento', 'Fechar', { duration: 3000 })
        });
      }
    });
  }

  downloadTodosDocumentos() {
    this.snackBar.open('Iniciando download de todos os documentos...', 'Fechar', { duration: 2000 });
    this.documentos().content.forEach(doc => this.baixarDocumento(doc));
  }

  // Removido getDocumentUrl pois agora usamos previewUrl()

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.numero()) {
      const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
        data: { fileName: file.name }
      });

      dialogRef.afterClosed().subscribe(result => {
        const isContrato = result?.isContrato ?? false;
        this.documentoService.upload(this.numero()!, file, isContrato).subscribe({
          next: () => {
            this.snackBar.open('Documento enviado com sucesso', 'Fechar', { duration: 3000 });
            this.carregarDocumentos();
          },
          error: () => this.snackBar.open('Erro ao enviar documento', 'Fechar', { duration: 3000 })
        });
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

  onDiscard() {
    if (!this.numero()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar descarte',
        message: 'Tem certeza que deseja descartar este processo?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processState.discardProcess(this.numero()!).subscribe({
          next: () => {
            this.snackBar.open('Processo descartado com sucesso', 'Fechar', { duration: 3000 });
            this.goBack();
          },
          error: () => this.snackBar.open('Erro ao descartar processo', 'Fechar', { duration: 3000 })
        });
      }
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
