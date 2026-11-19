import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Funcionalidade } from '../../../core/models/funcionalidade.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, UsuarioResponse } from '../../../core/services/user.service';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../../core/models/processo/pagination.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-user-team-association',
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
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './user-team-association.component.html',
  styleUrl: './user-team-association.component.scss'
})
export class UserTeamAssociationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly equipeService = inject(EquipeService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  associationForm: FormGroup;
  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly equipes = signal<EquipeDto[]>([]);
  readonly loading = signal(false);
  readonly loadingList = signal(false);
  readonly funcionalidadesPorUsuario = signal<Record<string, Funcionalidade[]>>({});
  readonly funcionalidadesPorEquipe = signal<Record<string, Funcionalidade[]>>({});
  readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  displayedColumns: string[] = ['nome', 'username', 'role', 'equipe', 'acessoDireto', 'acessoEquipe', 'acoes'];

  constructor() {
    this.associationForm = this.fb.group({
      usuarioId: ['', Validators.required],
      equipeId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsuarios();
    this.loadEquipes();
  }

  loadUsuarios() {
    this.loadingList.set(true);
    this.userService.getUsuarios(0, 100).subscribe({
      next: (page: Page<UsuarioResponse>) => {
        this.usuarios.set(page.content);
        this.carregarFuncionalidades(page.content);
        this.loadingList.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar usuários');
        this.loadingList.set(false);
      }
    });
  }

  loadEquipes() {
    this.equipeService.getEquipes(0, 100).subscribe({
      next: (page: Page<EquipeDto>) => {
        this.equipes.set(page.content.filter(e => e.ativo));
        this.carregarFuncionalidadesEquipes(page.content);
      },
      error: () => {
        this.notification.error('Erro ao carregar equipes');
      }
    });
  }

  onSubmit() {
    if (this.associationForm.valid) {
      this.loading.set(true);
      const { usuarioId, equipeId } = this.associationForm.value;

      this.userService.associarEquipe(usuarioId, equipeId).subscribe({
        next: () => {
          this.notification.success('Usuário vinculado com sucesso!');
          
          // Encontra o nome da equipe vinculada
          const equipe = this.equipes().find(e => e.id === equipeId);
          const equipeNome = equipe ? equipe.nome : 'N/A';

          // Atualiza a listagem local
          this.usuarios.update(list => 
            list.map(u => u.id === usuarioId ? { ...u, equipeId, equipeNome } : u)
          );

          this.associationForm.reset();
          this.associationForm.get('usuarioId')?.setErrors(null);
          this.associationForm.get('equipeId')?.setErrors(null);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.notification.error(err?.error?.message ?? 'Erro ao vincular usuário');
          this.loading.set(false);
        }
      });
    }
  }

  desvincular(usuarioId: string) {
    this.userService.desassociarEquipe(usuarioId).subscribe({
      next: () => {
        this.notification.success('Usuário desvinculado com sucesso!');
        // Atualiza a listagem local
        this.usuarios.update(list => 
          list.map(u => u.id === usuarioId ? { ...u, equipeId: undefined, equipeNome: undefined } : u)
        );
      },
      error: (err: any) => {
        this.notification.error(err?.error?.message ?? 'Erro ao desvincular usuário');
      }
    });
  }

  back() {
    void this.router.navigate(['/admin']);
  }

  temFuncionalidade(usuarioId: string, funcionalidade: Funcionalidade): boolean {
    return (this.funcionalidadesPorUsuario()[usuarioId] ?? []).includes(funcionalidade);
  }

  alternarFuncionalidade(usuarioId: string, funcionalidade: Funcionalidade) {
    if (!this.isAdmin()) {
      return;
    }

    const possui = this.temFuncionalidade(usuarioId, funcionalidade);
    const requisicao = possui
      ? this.userService.removerFuncionalidade(usuarioId, funcionalidade)
      : this.userService.adicionarFuncionalidade(usuarioId, funcionalidade);

    requisicao.subscribe({
      next: () => {
        this.funcionalidadesPorUsuario.update((mapa) => {
          const atuais = mapa[usuarioId] ?? [];
          return {
            ...mapa,
            [usuarioId]: possui
              ? atuais.filter((item) => item !== funcionalidade)
              : [...atuais, funcionalidade],
          };
        });
        this.notification.success(
          possui
            ? 'Acesso direto ao acompanhamento removido. O usuário deve entrar novamente para atualizar o acesso.'
            : 'Acesso direto ao acompanhamento concedido. O usuário deve entrar novamente para receber o acesso.',
        );
      },
      error: () => this.notification.error('Erro ao atualizar funcionalidade'),
    });
  }

  temFuncionalidadeHerdada(usuario: UsuarioResponse): boolean {
    const equipe = this.equipes().find((item) => item.id === usuario.equipeId);
    return !!equipe?.ativo
      && (this.funcionalidadesPorEquipe()[equipe.id] ?? []).includes('FUNC_ACOMPANHAMENTO');
  }

  private carregarFuncionalidades(usuarios: UsuarioResponse[]) {
    for (const usuario of usuarios) {
      this.userService.listarFuncionalidades(usuario.id).subscribe({
        next: (funcionalidades) =>
          this.funcionalidadesPorUsuario.update((mapa) => ({
            ...mapa,
            [usuario.id]: funcionalidades,
          })),
      });
    }
  }

  private carregarFuncionalidadesEquipes(equipes: EquipeDto[]) {
    for (const equipe of equipes) {
      this.equipeService.listarFuncionalidades(equipe.id).subscribe({
        next: (funcionalidades) =>
          this.funcionalidadesPorEquipe.update((mapa) => ({
            ...mapa,
            [equipe.id]: funcionalidades,
          })),
      });
    }
  }
}
