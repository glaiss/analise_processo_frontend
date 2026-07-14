import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContactProcessDialogComponent } from './contact-process-dialog.component';

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

describe('ContactProcessDialogComponent', () => {
  let dialogRefSpy: any;

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactProcessDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { numero: '123' },
        },
      ],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(ContactProcessDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should close with form data on confirm when form is valid', () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    comp.tipo = 'EMAIL';
    comp.valor = 'teste@exemplo.com';
    comp.nome = 'Maria';

    comp.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      tipo: 'EMAIL',
      valor: 'teste@exemplo.com',
      nome: 'Maria',
      principal: false,
    });
  });

  it('should not close on confirm when valor is empty', () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    comp.valor = '';

    comp.onConfirm();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close with null on cancel', () => {
    const fixture = createFixture();
    fixture.componentInstance.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
  });

  it('should return false from podeSalvar when valor is empty', () => {
    const fixture = createFixture();
    fixture.componentInstance.valor = '';
    expect(fixture.componentInstance.podeSalvar()).toBe(false);
  });

  it('should return true from podeSalvar when valor is filled', () => {
    const fixture = createFixture();
    fixture.componentInstance.valor = '11999999999';
    expect(fixture.componentInstance.podeSalvar()).toBe(true);
  });

  it('should have default tipo as WHATSAPP', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.tipo).toBe('WHATSAPP');
  });

  it('should have empty default valor', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.valor).toBe('');
  });

  it('should include principal field in confirm data', () => {
    const fixture = createFixture();
    const comp = fixture.componentInstance;
    comp.tipo = 'WHATSAPP';
    comp.valor = '11988888888';
    comp.nome = 'Teste';
    comp.principal = true;

    comp.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      tipo: 'WHATSAPP',
      valor: '11988888888',
      nome: 'Teste',
      principal: true,
    });
  });
});
