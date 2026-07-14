import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
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
      imports: [ContactProcessDialogComponent, MatDialogModule, MatTooltipModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            numero: '123',
            contatos: [
              { id: 'c1', tipo: 'WHATSAPP', valor: '11999999999', nome: 'João', principal: true },
            ],
          },
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

  it('should display existing contacts', () => {
    const fixture = createFixture();
    const contactItems = fixture.nativeElement.querySelectorAll('.contact-item');
    expect(contactItems.length).toBe(1);
    expect(contactItems[0].textContent).toContain('João');
    expect(contactItems[0].textContent).toContain('11999999999');
  });

  it('should show chat icon for WhatsApp contact', () => {
    const fixture = createFixture();
    const icon = fixture.nativeElement.querySelector('.contact-item mat-icon');
    expect(icon.textContent).toContain('chat');
  });

  it('should close with contact data on selecionar', () => {
    const fixture = createFixture();
    const selectBtn = fixture.nativeElement.querySelector('.contact-item button');
    selectBtn.click();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      tipo: 'WHATSAPP',
      valor: '11999999999',
      nome: 'João',
    });
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
});

describe('ContactProcessDialogComponent without contacts', () => {
  let dialogRefSpy: any;

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactProcessDialogComponent, MatDialogModule, MatTooltipModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { numero: '456', contatos: [] },
        },
      ],
    }).compileComponents();
  });

  it('should not show existing contacts section when empty', () => {
    const fixture = TestBed.createComponent(ContactProcessDialogComponent);
    fixture.detectChanges();
    const contactItems = fixture.nativeElement.querySelectorAll('.contact-item');
    expect(contactItems.length).toBe(0);
  });

  it('should allow creating a new contact', () => {
    const fixture = TestBed.createComponent(ContactProcessDialogComponent);
    const comp = fixture.componentInstance;
    comp.tipo = 'EMAIL';
    comp.valor = 'teste@email.com';
    comp.nome = 'Empresa X';
    fixture.detectChanges();

    comp.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      tipo: 'EMAIL',
      valor: 'teste@email.com',
      nome: 'Empresa X',
    });
  });
});

describe('ContactProcessDialogComponent with EMAIL contact', () => {
  let dialogRefSpy: any;

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactProcessDialogComponent, MatDialogModule, MatTooltipModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            numero: '789',
            contatos: [
              { id: 'c2', tipo: 'EMAIL', valor: 'joao@email.com', nome: 'João', principal: true },
            ],
          },
        },
      ],
    }).compileComponents();
  });

  it('should show email icon for EMAIL contact', () => {
    const fixture = TestBed.createComponent(ContactProcessDialogComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.contact-item mat-icon');
    expect(icon.textContent).toContain('email');
  });

  it('should select EMAIL contact', () => {
    const fixture = TestBed.createComponent(ContactProcessDialogComponent);
    fixture.detectChanges();
    const selectBtn = fixture.nativeElement.querySelector('.contact-item button');
    selectBtn.click();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      tipo: 'EMAIL',
      valor: 'joao@email.com',
      nome: 'João',
    });
  });
});
