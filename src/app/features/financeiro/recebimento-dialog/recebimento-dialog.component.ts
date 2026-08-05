import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FORMA_PAGAMENTO_LABEL, FormaPagamento } from '../../../core/models/financeiro/recebimento.model';

interface RecebimentoDialogData {
  parcelaId: string;
}

@Component({
  selector: 'app-recebimento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar Recebimento</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Valor recebido</mat-label>
        <input matInput type="number" min="0.01" [(ngModel)]="valor" placeholder="0,00">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Juros/multa</mat-label>
        <input matInput type="number" min="0" [(ngModel)]="jurosMulta" placeholder="0,00">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Forma de pagamento</mat-label>
        <mat-select [(ngModel)]="formaPagamento">
          @for (f of formas; track f) {
            <mat-option [value]="f">{{ formaLabels[f] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Data do recebimento</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="dataRecebimento" readonly>"
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="!podeSalvar() || salvando">
        <mat-icon>payments</mat-icon>
        {{ salvando ? 'Salvando...' : 'Registrar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
    .full-width { width: 100%; }
  `,
})
export class RecebimentoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RecebimentoDialogComponent, boolean>);
  private readonly dialogData: RecebimentoDialogData = inject(MAT_DIALOG_DATA);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);

  readonly formaLabels = FORMA_PAGAMENTO_LABEL;
  readonly formas: FormaPagamento[] = Object.keys(FORMA_PAGAMENTO_LABEL) as FormaPagamento[];

  valor: number | null = null;
  jurosMulta: number = 0;
  formaPagamento: FormaPagamento = 'PIX';
  dataRecebimento: Date = new Date();
  salvando = false;

  podeSalvar(): boolean {
    return this.valor !== null && this.valor > 0;
  }

  onConfirm() {
    if (!this.podeSalvar() || this.salvando) return;
    this.salvando = true;
    const dto = {
      parcelaId: this.dialogData.parcelaId,
      valorRecebido: this.valor!,
      jurosMulta: this.jurosMulta || 0,
      formaPagamento: this.formaPagamento,
      dataRecebimento: this.toIso(this.dataRecebimento),
    };
    this.financeiroService.registrarRecebimento(dto).subscribe({
      next: () => {
        this.notification.success('Recebimento registrado com sucesso!');
        this.salvando = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        const message = err?.error?.message ?? 'Erro ao registrar recebimento';
        this.notification.error(message);
        this.salvando = false;
      },
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  private toIso(date: Date): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}