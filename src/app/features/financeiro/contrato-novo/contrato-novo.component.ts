import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentoService } from '../../../core/services/documento.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { Cliente } from '../../../core/models/financeiro/cliente.model';
import { ModalidadeContrato } from '../../../core/models/financeiro/contrato.model';
import { Contrato } from '../../../core/models/financeiro/parcela.model';
import {
  ContratoConcluidoDialogComponent,
  DadosCliente,
} from '../contrato-concluido-dialog/contrato-concluido-dialog.component';

@Component({
  selector: 'app-contrato-novo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PageHeaderComponent,
  ],
  templateUrl: './contrato-novo.component.html',
  styleUrl: './contrato-novo.component.scss',
})
export class ContratoNovoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly documentoService = inject(DocumentoService);

  readonly loading = signal(false);
  readonly loadingClientes = signal(false);
  readonly clientes = signal<Cliente[]>([]);
  readonly documentoSelecionado = signal<{ nome: string; id: string } | null>(null);
  readonly enviandoDocumento = signal(false);

  readonly modalidades: ModalidadeContrato[] = ['FIXA', 'HONORARIOS', 'EXITO', 'RECORRENTE'];
  readonly modalidadeLabels: Record<string, string> = {
    FIXA: 'Fixa',
    HONORARIOS: 'Honorários',
    EXITO: 'Êxito',
    RECORRENTE: 'Recorrente',
  };

  form!: FormGroup;
  numeroProcesso: string | null = null;

  constructor() {
    this.numeroProcesso = this.route.snapshot.paramMap.get('numeroProcesso');
    this.buildForm();
  }

  private buildForm() {
    this.form = this.fb.group({
      numeroContrato: ['', Validators.required],
      descricao: [''],
      modalidade: ['FIXA', Validators.required],
      clienteId: [null],
      novoCliente: this.fb.group({
        nome: [''],
        cpfCnpj: [''],
        email: [''],
        telefone: [''],
      }),
      valorTotal: [0, [Validators.required, Validators.min(0.01)]],
      valorDesconto: [0, [Validators.min(0)]],
      dataAssinatura: [null],
      parcelas: this.fb.array([]),
    });
    this.addParcela();
  }

  get parcelas(): FormArray {
    return this.form.get('parcelas') as FormArray;
  }

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.loadingClientes.set(true);
    this.financeiroService.listarClientes(0, 200).subscribe({
      next: (page) => {
        this.clientes.set(page.content);
        this.loadingClientes.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar clientes');
        this.loadingClientes.set(false);
      },
    });
  }

  addParcela() {
    this.parcelas.push(
      this.fb.group({
        valor: [0, [Validators.required, Validators.min(0.01)]],
        dataVencimento: [null, Validators.required],
      }),
    );
  }

  removeParcela(index: number) {
    if (this.parcelas.length > 1) {
      this.parcelas.removeAt(index);
    }
  }

  get somaParcelas(): number {
    return this.parcelas.controls.reduce((acc, c) => acc + (Number(c.get('valor')?.value) || 0), 0);
  }

  get valorLiquido(): number {
    const total = Number(this.form.get('valorTotal')?.value) || 0;
    const desconto = Number(this.form.get('valorDesconto')?.value) || 0;
    return total - desconto;
  }

  get parcelasConferem(): boolean {
    const liquido = this.valorLiquido;
    return Math.abs(this.somaParcelas - liquido) < 0.01;
  }

  escolherDocumento(event: any) {
    const file: File = event.target.files?.[0];
    if (!file || !this.numeroProcesso) {
      return;
    }
    if (file.type !== 'application/pdf') {
      this.notification.error('Apenas arquivos PDF são permitidos para o contrato.');
      return;
    }
    this.enviandoDocumento.set(true);
    this.documentoService.upload(this.numeroProcesso, file, true).subscribe({
      next: (doc) => {
        this.documentoSelecionado.set({ nome: doc.nomeArquivo, id: doc.id });
        this.notification.success('Documento do contrato anexado com sucesso!');
        this.enviandoDocumento.set(false);
      },
      error: (err: any) => {
        const message = err?.error?.message ?? 'Erro ao anexar documento';
        this.notification.error(message);
        this.enviandoDocumento.set(false);
      },
    });
  }

  fechar() {
    if (this.form.invalid) {
      this.notification.warn('Preencha todos os campos obrigatórios');
      return;
    }
    if (!this.parcelasConferem) {
      this.notification.error('A soma das parcelas deve ser igual ao valor líquido (total − desconto)');
      return;
    }

    const v = this.form.value;
    const clienteNovo = this.form.get('novoCliente')?.value;
    const temClienteNovo = clienteNovo?.nome?.trim().length > 0;

    const dto = {
      numeroContrato: v.numeroContrato.trim(),
      descricao: v.descricao?.trim() || null,
      modalidade: v.modalidade,
      clienteId: v.clienteId || null,
      cliente: temClienteNovo
        ? {
            nome: clienteNovo.nome.trim(),
            cpfCnpj: clienteNovo.cpfCnpj?.trim() || null,
            email: clienteNovo.email?.trim() || null,
            telefone: clienteNovo.telefone?.trim() || null,
            tipo: 'PJ',
          }
        : null,
      documentoId: this.documentoSelecionado()?.id || null,
      valorTotal: v.valorTotal,
      valorDesconto: v.valorDesconto || 0,
      dataAssinatura: v.dataAssinatura ? this.toIso(v.dataAssinatura) : null,
      parcelas: this.parcelas.controls.map((p, index) => ({
        numero: index + 1,
        valor: Number(p.get('valor')?.value),
        dataVencimento: this.toIso(p.get('dataVencimento')?.value),
      })),
    };

    this.loading.set(true);
    const request = this.numeroProcesso
      ? this.financeiroService.fecharContratoParaProcesso(this.numeroProcesso, dto)
      : this.financeiroService.fecharContrato(dto);

    request.subscribe({
      next: (contrato: Contrato) => {
        this.notification.success('Contrato fechado com sucesso!');
        this.loading.set(false);
        this.abrirModalConclusao(contrato, temClienteNovo ? clienteNovo : null);
      },
      error: (err: any) => {
        const message = err?.error?.message ?? 'Erro ao fechar contrato';
        this.notification.error(message);
        this.loading.set(false);
      },
    });
  }

  private abrirModalConclusao(contrato: Contrato, clienteNovo: any) {
    const dadosCliente: DadosCliente | undefined = clienteNovo?.nome
      ? {
          nome: clienteNovo.nome,
          cpfCnpj: clienteNovo.cpfCnpj,
          email: clienteNovo.email,
          telefone: clienteNovo.telefone,
        }
      : undefined;

    const dialogRef = this.dialog.open(ContratoConcluidoDialogComponent, {
      width: '520px',
      data: { contrato, cliente: dadosCliente },
    });

    dialogRef.afterClosed().subscribe((acao: any) => {
      if (acao === 'verContrato') {
        void this.router.navigate(['/financeiro/contratos', contrato.id]);
      } else {
        void this.router.navigate(['/financeiro/contratos']);
      }
    });
  }

  private toIso(date: Date): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  voltar() {
    void this.router.navigate(['/financeiro/contratos']);
  }
}