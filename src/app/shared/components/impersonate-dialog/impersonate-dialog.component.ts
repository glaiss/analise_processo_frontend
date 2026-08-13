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
  templateUrl: './impersonate-dialog.component.html',
  styleUrl: './impersonate-dialog.component.scss'
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
