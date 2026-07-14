import { TestBed } from '@angular/core/testing';
import { ProcessSidebarListComponent } from './process-sidebar-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProcessoResumoDTO } from '../../../core/models/processo/processo-resumo.model';
import { ProcessoSituacao, StatusAtribuicao } from '../../../core/models/processo/enums.model';

function createProcesso(overrides?: Partial<ProcessoResumoDTO>): ProcessoResumoDTO {
  return {
    numero: '0000001-12.2023.8.26.0100',
    classeJudicial: 'Procedimento Comum',
    assuntoJudicial: 'Indenização',
    dataAjuizamento: '2023-01-15T10:00:00',
    scoreFinal: 75,
    nivel: 'ALTO',
    statusAtribuicao: StatusAtribuicao.DISPONIVEL,
    usuarioResponsavel: null,
    prazoVencendo: false,
    diasParaVencer: 30,
    processoSituacao: ProcessoSituacao.ENRIQUECIDO,
    monitorado: false,
    ...overrides,
  };
}

describe('ProcessSidebarListComponent', () => {
  let router: any;

  beforeEach(async () => {
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProcessSidebarListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ProcessStateService,
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProcessSidebarListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should navigate to processo details on navigate', () => {
    const fixture = TestBed.createComponent(ProcessSidebarListComponent);
    fixture.componentInstance.navigate('123');
    expect(router.navigate).toHaveBeenCalledWith(['/processos', '123']);
  });

  it('should render list of processos from ProcessStateService', () => {
    const fixture = TestBed.createComponent(ProcessSidebarListComponent);
    const service = TestBed.inject(ProcessStateService);
    service.setProcesses([createProcesso()]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('a[mat-list-item]');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('0000001-12.2023.8.26.0100');
  });

  it('should render multiple processos', () => {
    const fixture = TestBed.createComponent(ProcessSidebarListComponent);
    const service = TestBed.inject(ProcessStateService);
    service.setProcesses([
      createProcesso({ numero: '0000001' }),
      createProcesso({ numero: '0000002' }),
    ]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('a[mat-list-item]');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('0000001');
    expect(items[1].textContent).toContain('0000002');
  });

  it('should navigate when clicking a process item', () => {
    const fixture = TestBed.createComponent(ProcessSidebarListComponent);
    const service = TestBed.inject(ProcessStateService);
    service.setProcesses([createProcesso()]);
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('a[mat-list-item]');
    item.click();
    expect(router.navigate).toHaveBeenCalledWith(['/processos', '0000001-12.2023.8.26.0100']);
  });
});
