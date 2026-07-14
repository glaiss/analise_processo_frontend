import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-meus-dados',
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
    MatDividerModule
  ],
  templateUrl: './meus-dados.component.html',
  styleUrl: './meus-dados.component.scss'
})
export class MeusDadosComponent {
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  currentUser = this.auth.currentUser;

  readonly nome = signal(this.currentUser()?.nome ?? '');
  readonly email = signal(this.currentUser()?.username ?? '');

  readonly loadingNome = signal(false);
  readonly loadingEmail = signal(false);
  readonly errorNome = signal<string | null>(null);
  readonly errorEmail = signal<string | null>(null);

  salvarNome() {
    this.errorNome.set(null);

    const novoNome = this.nome().trim();
    if (!novoNome) {
      this.errorNome.set('O nome não pode ficar vazio.');
      return;
    }

    this.loadingNome.set(true);
    this.auth.alterarNome(novoNome).subscribe({
      next: () => {
        this.loadingNome.set(false);
        this.notification.success('Nome alterado com sucesso.');
      },
      error: (err) => {
        this.loadingNome.set(false);
        this.handleError(err, 'Erro ao alterar nome.', this.errorNome);
      }
    });
  }

  salvarEmail() {
    this.errorEmail.set(null);

    const novoEmail = this.email().trim();
    if (!novoEmail) {
      this.errorEmail.set('O email não pode ficar vazio.');
      return;
    }

    if (!novoEmail.includes('@')) {
      this.errorEmail.set('Informe um email válido.');
      return;
    }

    this.loadingEmail.set(true);
    this.auth.alterarEmail(novoEmail).subscribe({
      next: () => {
        this.loadingEmail.set(false);
        this.notification.success('Email alterado com sucesso.');
      },
      error: (err) => {
        this.loadingEmail.set(false);
        this.handleError(err, 'Erro ao alterar email.', this.errorEmail);
      }
    });
  }

  private handleError(err: any, defaultMsg: string, errorSignal: ReturnType<typeof signal<string | null>>) {
    if (err.status === 409) {
      errorSignal.set(err.error?.detail ?? 'Este email já está em uso.');
    } else if (err.status === 0) {
      errorSignal.set('Sistema indisponível. Verifique sua conexão.');
    } else {
      errorSignal.set(defaultMsg);
    }
  }
}
