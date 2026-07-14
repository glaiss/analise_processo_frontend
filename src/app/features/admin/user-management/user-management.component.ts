import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Role, UserService } from '../../../core/services/user.service';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { Page } from '../../../core/models/processo/pagination.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-management',
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
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly equipeService = inject(EquipeService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  userForm: FormGroup;
  roles = Object.values(Role);
  readonly equipes = signal<EquipeDto[]>([]);
  readonly loading = signal(false);
  readonly loadingEquipes = signal(false);
  
  // Controle de paginação para equipes
  private currentPage = 0;
  private isLastPage = false;

  constructor() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [Role.ANALISTA, Validators.required],
      equipeId: [null]
    });

    this.loadEquipes();
  }

  loadEquipes() {
    if (this.loadingEquipes() || this.isLastPage) return;

    this.loadingEquipes.set(true);
    this.equipeService.getEquipes(this.currentPage).subscribe({
      next: (page: Page<EquipeDto>) => {
        this.equipes.set([...this.equipes(), ...page.content]);
        this.isLastPage = page.last;
        this.currentPage++;
        this.loadingEquipes.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar equipes');
        this.loadingEquipes.set(false);
      }
    });
  }

  onSelectOpened() {
    // Se ainda não carregou nenhuma ou se precisar de mais lógica ao abrir
    if (this.equipes().length === 0) {
      this.loadEquipes();
    }
  }

  onEquipesScroll(event: any) {
    const threshold = 50;
    const {target} = event;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - threshold) {
      this.loadEquipes();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading.set(true);
      this.userService.criarUsuario(this.userForm.value).subscribe({
        next: () => {
          this.notification.success('Usuário criado com sucesso!');
          void this.router.navigate(['/admin']);
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('Erro ao criar usuário');
          this.loading.set(false);
        }
      });
    }
  }

  back() {
    void this.router.navigate(['/admin']);
  }
}
