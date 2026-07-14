import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DistributionService, RedirecionarProcessoRequest } from '../../../core/services/distribution.service';
import { UserService, UsuarioResponse } from '../../../core/services/user.service';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { Page } from '../../../core/models/processo/pagination.model';

@Component({
  selector: 'app-redirecionar-processos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    PageHeaderComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './redirecionar-processos.component.html',
  styleUrl: './redirecionar-processos.component.scss'
})
export class RedirecionarProcessosComponent implements OnInit {
  private readonly distService = inject(DistributionService);
  private readonly userService = inject(UserService);
  private readonly equipeService = inject(EquipeService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly loadingUsuarios = signal(false);
  readonly loadingEquipes = signal(false);

  // Origem: 'disponiveis' (nao atribuidos) ou 'usuario' (de um usuario especifico)
  readonly origemTipo = signal<'disponiveis' | 'usuario'>('usuario');
  readonly selectedOrigemUsuarioId = signal<string>('');

  // Destino
  readonly tipoDestino = signal<'PESSOA' | 'EQUIPE'>('PESSOA');
  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly equipes = signal<EquipeDto[]>([]);
  readonly selectedDestinoUsuarioId = signal<string>('');
  readonly selectedDestinoEquipeId = signal<string>('');

  ngOnInit() {
    this.loadUsuarios();
    this.loadEquipes();
  }

  loadUsuarios() {
    this.loadingUsuarios.set(true);
    this.userService.getUsuarios(0, 200).subscribe({
      next: (page: Page<UsuarioResponse>) => {
        this.usuarios.set(page.content.filter(u => u.nome));
        this.loadingUsuarios.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar usuários');
        this.loadingUsuarios.set(false);
      }
    });
  }

  loadEquipes() {
    this.loadingEquipes.set(true);
    this.equipeService.getEquipes(0, 100).subscribe({
      next: (page: Page<EquipeDto>) => {
        this.equipes.set(page.content.filter(e => e.ativo));
        this.loadingEquipes.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar equipes');
        this.loadingEquipes.set(false);
      }
    });
  }

  redirecionar() {
    if (this.origemTipo() === 'usuario' && !this.selectedOrigemUsuarioId()) {
      this.notification.warn('Selecione o usuário de origem.');
      return;
    }
    if (this.tipoDestino() === 'PESSOA' && !this.selectedDestinoUsuarioId()) {
      this.notification.warn('Selecione o usuário de destino.');
      return;
    }
    if (this.tipoDestino() === 'EQUIPE' && !this.selectedDestinoEquipeId()) {
      this.notification.warn('Selecione a equipe de destino.');
      return;
    }

    const request: RedirecionarProcessoRequest = {
      tipo: this.tipoDestino(),
      ...(this.origemTipo() === 'usuario'
        ? { origemUsuarioId: this.selectedOrigemUsuarioId() }
        : {}),
      ...(this.tipoDestino() === 'PESSOA'
        ? { usuarioId: this.selectedDestinoUsuarioId() }
        : { equipeId: this.selectedDestinoEquipeId() })
    };

    this.loading.set(true);
    this.distService.redirecionarProcessos(request).subscribe({
      next: () => {
        this.notification.success('Processos redirecionados com sucesso!');
        this.loading.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Erro ao redirecionar processos.';
        this.notification.error(msg);
        this.loading.set(false);
      }
    });
  }
}
