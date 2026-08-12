import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { ContratoListaComponent } from './contrato-lista.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Contrato } from '../../../core/models/financeiro/parcela.model';
import { StatusContrato } from '../../../core/models/financeiro/contrato.model';
import { of, throwError } from 'rxjs';

describe('ContratoListaComponent', () => {
  let mockFinanceiro: Partial<FinanceiroService>;
  let mockNotification: Partial<NotificationService>;

  const contratos: Contrato[] = [
    {
      id: 'c1',
      numeroContrato: '2026-001',
      clienteNome: 'Empresa A',
      modalidade: 'FIXA',
      valorTotal: 1000,
      valorDesconto: 0,
      valorRecebido: 400,
      valorPendente: 600,
      dataFechamento: '2026-01-10',
      status: 'ATIVO',
      parcelas: [],
    },
    {
      id: 'c2',
      numeroContrato: '2026-002',
      clienteNome: null,
      modalidade: 'EXITO',
      valorTotal: 2000,
      valorDesconto: 100,
      valorRecebido: 2000,
      valorPendente: 0,
      dataFechamento: '2026-02-01',
      status: 'PAGO',
      parcelas: [],
    },
  ];

  const page = (content: Contrato[]) => ({
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    last: true,
    first: true,
    empty: content.length === 0,
  });

  beforeEach(async () => {
    mockFinanceiro = {
      listarContratos: vi.fn().mockReturnValue(of(page(contratos))),
    };

    mockNotification = {
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ContratoListaComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: FinanceiroService, useValue: mockFinanceiro },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load contratos on init', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    expect(mockFinanceiro.listarContratos).toHaveBeenCalledWith(0, 20);
    expect(fixture.componentInstance.contratos().length).toBe(2);
    expect(fixture.componentInstance.total()).toBe(2);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should notify error when loading contratos fails', () => {
    mockFinanceiro.listarContratos = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao carregar contratos');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should update page size and reload on page event', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance, 'carregar');
    fixture.componentInstance.onPage({ pageIndex: 2, pageSize: 50, length: 100 });

    expect(fixture.componentInstance.pageSize()).toBe(50);
    expect(spy).toHaveBeenCalledWith(2, 50);
  });

  it('should navigate to contract situation on abrirSituacao', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.abrirSituacao('c1');
    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos', 'c1']);
  });

  it('should navigate to new contract on novoContrato', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.novoContrato();
    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos/novo']);
  });

  it('should map status to label', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.statusLabel('ATIVO' as StatusContrato)).toBe('Ativo');
    expect(fixture.componentInstance.statusLabel('DESCONHECIDO' as StatusContrato)).toBe('DESCONHECIDO');
  });

  it('should format currency in pt-BR', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formatCurrency(1234.5)).toContain('1.234,50');
    expect(fixture.componentInstance.formatCurrency(null as unknown as number)).toContain('0,00');
  });

  it('should render table rows', () => {
    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should render empty state when no contratos', () => {
    mockFinanceiro.listarContratos = vi.fn().mockReturnValue(of(page([])));

    const fixture = TestBed.createComponent(ContratoListaComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum contrato encontrado');
  });
});
