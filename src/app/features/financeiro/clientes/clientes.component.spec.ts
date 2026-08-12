import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ClientesComponent } from './clientes.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Cliente } from '../../../core/models/financeiro/cliente.model';
import { of, throwError } from 'rxjs';

describe('ClientesComponent', () => {
  let mockFinanceiro: Partial<FinanceiroService>;
  let mockNotification: Partial<NotificationService>;

  const page = (content: Cliente[]) => ({
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 200,
    number: 0,
    last: true,
    first: true,
    empty: content.length === 0,
  });

  beforeEach(async () => {
    mockFinanceiro = {
      listarClientes: vi.fn().mockReturnValue(of(page([
        { id: '1', nome: 'Empresa A', cpfCnpj: '11.111.111/0001-11', email: 'a@a.com', ativo: true, tipo: 'PJ' },
        { id: '2', nome: 'João da Silva', cpfCnpj: '222.222.222-22', telefone: '(11) 99999-9999', ativo: true, tipo: 'PF' },
      ]))),
      criarCliente: vi.fn().mockReturnValue(of({ id: '3', nome: 'Nova Empresa', cpfCnpj: '33.333.333/0001-33', ativo: true, tipo: 'PJ' } as Cliente)),
    };

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ClientesComponent, NoopAnimationsModule],
      providers: [
        { provide: FinanceiroService, useValue: mockFinanceiro },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ClientesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load clientes on init', () => {
    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    expect(mockFinanceiro.listarClientes).toHaveBeenCalledWith(0, 200);
    expect(fixture.componentInstance.clientes().length).toBe(2);
    expect(fixture.componentInstance.loadingList()).toBe(false);
  });

  it('should notify error when loading clientes fails', () => {
    mockFinanceiro.listarClientes = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao carregar clientes');
    expect(fixture.componentInstance.loadingList()).toBe(false);
  });

  it('should not submit invalid form', () => {
    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    fixture.componentInstance.clienteForm.patchValue({ nome: 'X' });
    fixture.componentInstance.salvar();

    expect(mockFinanceiro.criarCliente).not.toHaveBeenCalled();
    expect(mockNotification.warn).toHaveBeenCalledWith('Informe o nome do cliente');
  });

  it('should create cliente and prepend to list', () => {
    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    fixture.componentInstance.clienteForm.patchValue({
      nome: '  Nova Empresa  ',
      tipo: 'PJ',
      cpfCnpj: '33.333.333/0001-33',
      email: 'contato@nova.com',
      telefone: '',
      origemCaptacao: 'Indicação',
    });
    fixture.componentInstance.salvar();

    expect(mockFinanceiro.criarCliente).toHaveBeenCalledWith({
      nome: 'Nova Empresa',
      tipo: 'PJ',
      cpfCnpj: '33.333.333/0001-33',
      email: 'contato@nova.com',
      telefone: null,
      origemCaptacao: 'Indicação',
    });
    expect(mockNotification.success).toHaveBeenCalledWith('Cliente cadastrado com sucesso!');
    expect(fixture.componentInstance.clientes().length).toBe(3);
    expect(fixture.componentInstance.clientes()[0].nome).toBe('Nova Empresa');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should notify backend error message when creating cliente fails', () => {
    mockFinanceiro.criarCliente = vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'CPF duplicado' } })));

    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    fixture.componentInstance.clienteForm.patchValue({ nome: 'Empresa X' });
    fixture.componentInstance.salvar();

    expect(mockNotification.error).toHaveBeenCalledWith('CPF duplicado');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should use generic message when backend error has no detail', () => {
    mockFinanceiro.criarCliente = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    fixture.componentInstance.clienteForm.patchValue({ nome: 'Empresa X' });
    fixture.componentInstance.salvar();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao cadastrar cliente');
  });

  it('should render rows in table', () => {
    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should render empty state when no clientes', () => {
    mockFinanceiro.listarClientes = vi.fn().mockReturnValue(of(page([])));

    const fixture = TestBed.createComponent(ClientesComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum cliente cadastrado');
  });
});
