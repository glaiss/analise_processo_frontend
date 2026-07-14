import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService, UsuarioResponse } from '../../../core/services/user.service';

@Component({
  selector: 'app-impersonate-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatAutocompleteModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Entrar como outro usuário</h2>
    <mat-dialog-content>
      <p>Selecione ou digite o e-mail do usuário no qual deseja entrar:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Buscar usuário</mat-label>
        <input
          matInput
          [(ngModel)]="searchTerm"
          [matAutocomplete]="auto"
          (input)="onSearchInput()"
          placeholder="Digite nome ou e-mail..."
          autocomplete="off"
        >
        @if (loading()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        } @else {
          <mat-icon matSuffix>person_search</mat-icon>
        }
      </mat-form-field>

      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onUserSelected($event)">
        @for (user of filteredUsers(); track user.id) {
          <mat-option [value]="user.username">
            <div class="user-option">
              <span class="user-option-name">{{ user.nome }}</span>
              <span class="user-option-email">{{ user.username }}</span>
            </div>
          </mat-option>
        }
        @if (noResults() && !loading()) {
          <mat-option disabled class="no-results">Nenhum usuário encontrado</mat-option>
        }
      </mat-autocomplete>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!selectedEmail && !searchTerm" (click)="confirm()">
        <mat-icon>visibility</mat-icon> Entrar
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .full-width { width: 100%; }
    mat-dialog-content { min-width: 400px; }
    .user-option {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
    }
    .user-option-name { font-weight: 500; font-size: 0.9rem; }
    .user-option-email { font-size: 0.75rem; color: var(--text-tertiary, #888); }
    .no-results { font-size: 0.85rem; color: var(--text-tertiary, #888); padding: 12px 16px; }
  `
})
export class ImpersonateDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ImpersonateDialogComponent>);
  private readonly userService = inject(UserService);

  readonly allUsers = signal<UsuarioResponse[]>([]);
  readonly loading = signal(false);
  searchTerm = '';
  selectedEmail = '';

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.allUsers();
    return this.allUsers().filter(u =>
      u.nome.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term)
    );
  });

  readonly noResults = computed(() => this.filteredUsers().length === 0);

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.loading.set(true);
    this.userService.getUsuarios(0, 500).subscribe({
      next: (page) => {
        this.allUsers.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchInput() {
    this.selectedEmail = '';
  }

  onUserSelected(event: any) {
    this.selectedEmail = event.option.value;
    this.searchTerm = event.option.value;
  }

  confirm() {
    const email = this.selectedEmail || this.searchTerm;
    if (email) {
      this.dialogRef.close(email);
    }
  }
}
