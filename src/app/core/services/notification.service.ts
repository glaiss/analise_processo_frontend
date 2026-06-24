import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
  };

  private show(message: string, panelClass: string, duration: number = 5000) {
    setTimeout(() => {
      this.snackBar.open(message, 'Fechar', {
        ...this.defaultConfig,
        duration,
        panelClass: [panelClass]
      });
    });
  }

  success(message: string, duration?: number) {
    this.show(message, 'success-snackbar', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error-snackbar', duration);
  }

  warn(message: string, duration?: number) {
    this.show(message, 'warn-snackbar', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info-snackbar', duration);
  }
}
