import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { EquipeService, EquipeDto } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Page } from '../../../core/models/processo/pagination.model';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './team-management.component.html',
  styleUrl: './team-management.component.scss'
})
export class TeamManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private equipeService = inject(EquipeService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  teamForm: FormGroup;
  equipes = signal<EquipeDto[]>([]);
  loading = signal(false);
  loadingList = signal(false);
  displayedColumns: string[] = ['nome', 'status'];

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
          const errorMessage = err?.error?.message || 'Erro ao criar equipe';
          this.notification.error(errorMessage);
          this.loading.set(false);
        }
      });
    }
  }

  back() {
    this.router.navigate(['/admin']);
  }
}
