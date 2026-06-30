import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './alterar-senha.component.html',
  styleUrl: './alterar-senha.component.scss'
})
export class AlterarSenhaComponent {
  private auth = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  senhaAtual = '';
  senhaNova = '';
  senhaConfirmacao = '';

  hideAtual = signal(true);
  hideNova = signal(true);
  hideConfirmacao = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    this.error.set(null);

    if (!this.senhaAtual || !this.senhaNova || !this.senhaConfirmacao) {
      this.error.set('Preencha todos os campos.');
      return;
    }

    if (this.senhaNova.length < 4) {
      this.error.set('Nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (this.senhaNova !== this.senhaConfirmacao) {
      this.error.set('Confirmação de senha não confere.');
      return;
    }

    this.loading.set(true);
    this.auth.alterarSenha(this.senhaAtual, this.senhaNova).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Senha alterada com sucesso.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          this.error.set(err.error?.detail || 'Senha atual incorreta.');
        } else if (err.status === 0) {
          this.error.set('Sistema indisponível. Verifique sua conexão.');
        } else {
          this.error.set('Erro ao alterar senha. Tente novamente.');
        }
      }
    });
  }
}
