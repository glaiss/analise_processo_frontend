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

  success(message: string) {
    setTimeout(() => {
      this.snackBar.open(message, 'Fechar', {
        ...this.defaultConfig,
        panelClass: ['success-snackbar']
      });
    });
  }

  error(message: string) {
    setTimeout(() => {
      this.snackBar.open(message, 'Fechar', {
        ...this.defaultConfig,
        panelClass: ['error-snackbar']
      });
    });
  }

  warn(message: string) {
    setTimeout(() => {
      this.snackBar.open(message, 'Fechar', {
        ...this.defaultConfig,
        panelClass: ['warn-snackbar']
      });
    });
  }
}
