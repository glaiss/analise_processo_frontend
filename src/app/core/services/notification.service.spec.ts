import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from './notification.service';
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi
      .fn()
      .mockImplementation((query: string) => ({
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
  it('should show success snackbar', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.success('Sucesso!');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Sucesso!',
          'Fechar',
          expect.objectContaining({ panelClass: ['success-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should show error snackbar', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.error('Erro!');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Erro!',
          'Fechar',
          expect.objectContaining({ panelClass: ['error-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should show warn snackbar', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.warn('Aviso!');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Aviso!',
          'Fechar',
          expect.objectContaining({ panelClass: ['warn-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should show info snackbar', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.info('Informativo!');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Informativo!',
          'Fechar',
          expect.objectContaining({ panelClass: ['info-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should accept custom duration', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.success('Rápido!', 1000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Rápido!',
          'Fechar',
          expect.objectContaining({ duration: 1000 }),
        );
        resolve();
      });
    });
  });
  it('should include default horizontal and vertical position in config', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.success('Teste');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Teste',
          'Fechar',
          expect.objectContaining({ horizontalPosition: 'right', verticalPosition: 'bottom' }),
        );
        resolve();
      });
    });
  });
  it('should show error snackbar with custom duration', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.error('Erro customizado!', 10000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Erro customizado!',
          'Fechar',
          expect.objectContaining({ duration: 10000, panelClass: ['error-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should show info snackbar with custom duration', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.info('Informativo customizado!', 3000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Informativo customizado!',
          'Fechar',
          expect.objectContaining({ duration: 3000, panelClass: ['info-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should show warn snackbar with custom duration', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.warn('Aviso customizado!', 7000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Aviso customizado!',
          'Fechar',
          expect.objectContaining({ duration: 7000, panelClass: ['warn-snackbar'] }),
        );
        resolve();
      });
    });
  });
  it('should use default duration of 5000 when not provided', async () => {
    const spy = vi.spyOn(snackBar, 'open');
    service.success('Default duration');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          'Default duration',
          'Fechar',
          expect.objectContaining({ duration: 5000 }),
        );
        resolve();
      });
    });
  });
});
