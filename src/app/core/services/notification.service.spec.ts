import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from './notification.service';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      providers: [NotificationService],
    });

    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success snackbar', () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.success('Sucesso!');
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('Sucesso!', 'Fechar', expect.objectContaining({
          panelClass: ['success-snackbar']
        }));
        resolve();
      });
    });
  });

  it('should show error snackbar', () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.error('Erro!');
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('Erro!', 'Fechar', expect.objectContaining({
          panelClass: ['error-snackbar']
        }));
        resolve();
      });
    });
  });

  it('should show warn snackbar', () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.warn('Aviso!');
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('Aviso!', 'Fechar', expect.objectContaining({
          panelClass: ['warn-snackbar']
        }));
        resolve();
      });
    });
  });

  it('should show info snackbar', () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.info('Informativo!');
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('Informativo!', 'Fechar', expect.objectContaining({
          panelClass: ['info-snackbar']
        }));
        resolve();
      });
    });
  });

  it('should accept custom duration', () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.success('Rápido!', 1000);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith('Rápido!', 'Fechar', expect.objectContaining({
          duration: 1000
        }));
        resolve();
      });
    });
  });
});
