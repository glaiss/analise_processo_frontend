import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Funcionalidade } from '../../../core/models/funcionalidade.model';
import { AuthService } from '../../../core/services/auth.service';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../../core/models/processo/pagination.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './team-management.component.html',
  styleUrl: './team-management.component.scss'
})
export class TeamManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly equipeService = inject(EquipeService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  teamForm: FormGroup;
  readonly equipes = signal<EquipeDto[]>([]);
  readonly loading = signal(false);
  readonly loadingList = signal(false);
  readonly funcionalidadesPorEquipe = signal<Record<string, Funcionalidade[]>>({});
  readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  displayedColumns: string[] = ['nome', 'status', 'acompanhamento'];

  constructor() {
    this.teamForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadEquipes();
  }

  loadEquipes() {
    this.loadingList.set(true);
    // Buscando as primeiras 100 equipes para a listagem
    this.equipeService.getEquipes(0, 100).subscribe({
      next: (page: Page<EquipeDto>) => {
        this.equipes.set(page.content);
        this.carregarFuncionalidades(page.content);
        this.loadingList.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar equipes');
        this.loadingList.set(false);
      }
    });
  }

  onSubmit() {
    if (this.teamForm.valid) {
      this.loading.set(true);
      const newTeam = {
        nome: this.teamForm.value.nome,
        ativo: true
      };

      this.equipeService.criarEquipe(newTeam).subscribe({
        next: (createdTeam: EquipeDto) => {
          this.notification.success('Equipe criada com sucesso!');
          // Atualiza a lista local adicionando a nova equipe no início
          this.equipes.update(list => [createdTeam, ...list]);
          this.teamForm.reset();
          this.teamForm.get('nome')?.setErrors(null);
          this.loading.set(false);
        },
        error: (err: any) => {
          const errorMessage = err?.error?.message ?? 'Erro ao criar equipe';
          this.notification.error(errorMessage);
          this.loading.set(false);
        }
      });
    }
  }

  back() {
    void this.router.navigate(['/admin']);
  }

  temFuncionalidade(equipeId: string, funcionalidade: Funcionalidade): boolean {
    return (this.funcionalidadesPorEquipe()[equipeId] ?? []).includes(funcionalidade);
  }

  alternarFuncionalidade(equipe: EquipeDto, funcionalidade: Funcionalidade) {
    if (!this.isAdmin() || !equipe.ativo) {
      return;
    }

    const possui = this.temFuncionalidade(equipe.id, funcionalidade);
    const requisicao = possui
      ? this.equipeService.removerFuncionalidade(equipe.id, funcionalidade)
      : this.equipeService.adicionarFuncionalidade(equipe.id, funcionalidade);

    requisicao.subscribe({
      next: () => {
        this.funcionalidadesPorEquipe.update((mapa) => {
          const atuais = mapa[equipe.id] ?? [];
          return {
            ...mapa,
            [equipe.id]: possui
              ? atuais.filter((item) => item !== funcionalidade)
              : [...atuais, funcionalidade],
          };
        });
        this.notification.success(
          possui
            ? 'Funcionalidade removida da equipe. Os membros devem entrar novamente para atualizar o acesso.'
            : 'Funcionalidade concedida à equipe. Os membros devem entrar novamente para receber o acesso.',
        );
      },
      error: () => this.notification.error('Erro ao atualizar funcionalidade da equipe'),
    });
  }

  private carregarFuncionalidades(equipes: EquipeDto[]) {
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
