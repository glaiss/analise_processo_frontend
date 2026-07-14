import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';

interface DialogData {
  fileName: string;
}

@Component({
  selector: 'app-upload-document-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, FormsModule],
  templateUrl: './upload-document-dialog.component.html',
  styleUrl: './upload-document-dialog.component.scss'
})
export class UploadDocumentDialogComponent {
  dialogRef = inject(MatDialogRef<UploadDocumentDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  fileName: string;
  isContrato = false;

  constructor() {
    this.fileName = this.data.fileName;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({ isContrato: this.isContrato });
  }
}
