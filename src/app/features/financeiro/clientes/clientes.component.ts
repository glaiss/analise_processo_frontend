import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Cliente, TipoCliente } from '../../../core/models/financeiro/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly loadingList = signal(false);
  readonly displayedColumns = ['nome', 'cpfCnpj', 'contato', 'tipo'];

  readonly tipos: Array<{ value: TipoCliente; label: string }> = [
    { value: 'PJ', label: 'Pessoa Jurídica' },
    { value: 'PF', label: 'Pessoa Física' },
  ];

  clienteForm: FormGroup;

  constructor() {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['PJ'],
      cpfCnpj: [''],
      email: [''],
      telefone: [''],
      origemCaptacao: [''],
    });
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loadingList.set(true);
    this.financeiroService.listarClientes(0, 200).subscribe({
      next: (page) => {
        this.clientes.set(page.content);
        this.loadingList.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar clientes');
        this.loadingList.set(false);
      },
    });
  }

  salvar() {
    if (this.clienteForm.invalid) {
      this.notification.warn('Informe o nome do cliente');
      return;
    }
    this.loading.set(true);
    const dto = {
      nome: this.clienteForm.value.nome.trim(),
      tipo: this.clienteForm.value.tipo,
      cpfCnpj: this.clienteForm.value.cpfCnpj?.trim() || null,
      email: this.clienteForm.value.email?.trim() || null,
      telefone: this.clienteForm.value.telefone?.trim() || null,
      origemCaptacao: this.clienteForm.value.origemCaptacao?.trim() || null,
    };
    this.financeiroService.criarCliente(dto).subscribe({
      next: (created) => {
        this.notification.success('Cliente cadastrado com sucesso!');
        this.clientes.update((list) => [created, ...list]);
        this.clienteForm.reset({ tipo: 'PJ' });
        this.loading.set(false);
      },
      error: (err: any) => {
        const message = err?.error?.message ?? 'Erro ao cadastrar cliente';
        this.notification.error(message);
        this.loading.set(false);
      },
    });
  }
}