import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UploadDocumentDialogComponent } from './upload-document-dialog.component';

describe('UploadDocumentDialogComponent', () => {
  let dialogRefSpy: any;

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UploadDocumentDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { fileName: 'documento.pdf' } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize fileName from data', () => {
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    expect(fixture.componentInstance.fileName).toBe('documento.pdf');
  });

  it('should initialize isContrato as false', () => {
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    expect(fixture.componentInstance.isContrato).toBe(false);
  });

  it('should display fileName', () => {
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('p, span, .file-name');
    expect(fixture.nativeElement.textContent).toContain('documento.pdf');
  });

  it('should close without data on cancel', () => {
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    fixture.detectChanges();

    fixture.componentInstance.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close with isContrato value on confirm', () => {
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    fixture.componentInstance.isContrato = true;

    fixture.componentInstance.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ isContrato: true });
  });
});
