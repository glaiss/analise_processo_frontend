import { Component, inject, output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ImpersonateDialogComponent } from '../../../shared/components/impersonate-dialog/impersonate-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, MatSnackBarModule, MatDialogModule, RouterLink, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly toggleSidenav = output<void>();

  get avatarLetter(): string {
    const user = this.auth.currentUser();
    const name = user?.nome ?? user?.username ?? '';
    return name.charAt(0).toUpperCase();
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: () => {}
    });
  }

  openImpersonateDialog() {
    const dialogRef = this.dialog.open(ImpersonateDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(targetEmail => {
      if (!targetEmail) return;

      this.auth.impersonate(targetEmail).subscribe({
        next: () => {
          this.notification.success(`Você entrou como ${targetEmail}`);
          void this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.notification.error('Erro ao entrar como usuário. Verifique o e-mail.');
        }
      });
    });
  }

  stopImpersonating() {
    this.auth.stopImpersonating().subscribe({
      next: () => {
        this.notification.success('Voltou para seu usuário administrador');
        void this.router.navigate(['/dashboard']);
      }
    });
  }

  meusDados() {
    void this.router.navigate(['/meus-dados']);
  }

  alterarSenha() {
    void this.router.navigate(['/alterar-senha']);
  }
}
