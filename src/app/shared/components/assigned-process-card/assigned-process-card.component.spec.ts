import { TestBed } from '@angular/core/testing';
import { AssignedProcessCardComponent } from './assigned-process-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AtribuicaoProcessoResumoDTO } from '../../../core/models/processo/atribuicao-processo-resumo.model';
import { StatusAtribuicao, ProcessoSituacao, TipologiaProcesso, ResultadoAtendimento } from '../../../core/models/processo/enums.model';
import { of } from 'rxjs';

function createAtribuicao(overrides?: Partial<AtribuicaoProcessoResumoDTO>): AtribuicaoProcessoResumoDTO {
  return {
    id: '1',
    status: StatusAtribuicao.ATRIBUIDO,
    resultadoAtendimento: null,
    statusPrazo: 'NORMAL',
    isVencendoPrazo: false,
    processoNumero: '0000001-12.2023.8.26.0100',
    processoTribunal: 'TJSP',
    processoOrgaoJulgadorNome: '1ª Vara Cível',
    processoDataAjuizamento: '2023-01-15T10:00:00',
    processoValorCausa: 50000,
    processoSituacao: ProcessoSituacao.ENRIQUECIDO,
    processoTipologia: TipologiaProcesso.JUDICIAL,
    processoScoreFinal: 85,
    processoEnriquecimentoStatus: 'CONCLUIDO',
    processoEnriquecimentoErro: '',
    equipeNome: 'Equipe A',
    usuarioNome: 'João Silva',
    monitorado: false,
    ...overrides,
  };
}

describe('AssignedProcessCardComponent', () => {
  let processState: any;
  let notification: any;
  let router: any;

  beforeEach(async () => {
    processState = { alternarMonitoramento: vi.fn() };
    notification = { success: vi.fn() };
    router = { navigate: vi.fn() };
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [AssignedProcessCardComponent, NoopAnimationsModule, MatSnackBarModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProcessStateService, useValue: processState },
        { provide: NotificationService, useValue: notification },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AssignedProcessCardComponent);
    fixture.componentRef.setInput('atribuicao', createAtribuicao());
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('toggleMonitoramento', () => {
    it('should toggle monitorado optimistically', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      const atribuicao = createAtribuicao({ monitorado: false });
      fixture.componentRef.setInput('atribuicao', atribuicao);
      processState.alternarMonitoramento.mockReturnValue(of(void 0));

      fixture.componentInstance.toggleMonitoramento(new MouseEvent('click'));
      expect(atribuicao.monitorado).toBe(true);
    });

    it('should revert on error', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      const atribuicao = createAtribuicao({ monitorado: false });
      fixture.componentRef.setInput('atribuicao', atribuicao);
      processState.alternarMonitoramento.mockReturnValue(of(void 0));

      fixture.componentInstance.toggleMonitoramento(new MouseEvent('click'));
      expect(atribuicao.monitorado).toBe(true);
    });
  });

  describe('copyProcessNumber', () => {
    it('should copy process number to clipboard', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao());

      await fixture.componentInstance.copyProcessNumber(new MouseEvent('click'));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0000001-12.2023.8.26.0100');
      expect(notification.success).toHaveBeenCalled();
    });
  });

  describe('scoreColor', () => {
    it('should return accent for score > 100', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ processoScoreFinal: 150 }));
      expect(fixture.componentInstance.scoreColor).toBe('accent');
    });

    it('should return primary for score between 51 and 100', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ processoScoreFinal: 75 }));
      expect(fixture.componentInstance.scoreColor).toBe('primary');
    });

    it('should return empty for score <= 50', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ processoScoreFinal: 30 }));
      expect(fixture.componentInstance.scoreColor).toBe('');
    });
  });

  describe('statusPrazoColor', () => {
    it('should return warn for URGENTE', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ statusPrazo: 'URGENTE' }));
      expect(fixture.componentInstance.statusPrazoColor).toBe('warn');
    });

    it('should return primary for other status', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ statusPrazo: 'NORMAL' }));
      expect(fixture.componentInstance.statusPrazoColor).toBe('primary');
    });
  });

  describe('openDetails', () => {
    it('should navigate to processo details', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao());

      fixture.componentInstance.openDetails(new MouseEvent('click'));
      expect(router.navigate).toHaveBeenCalledWith(['/processos', '0000001-12.2023.8.26.0100']);
    });
  });

  describe('statusColor', () => {
    const cases = [
      [StatusAtribuicao.NAO_DISPONIVEL, 'basic'],
      [StatusAtribuicao.DISPONIVEL, 'primary'],
      [StatusAtribuicao.ATRIBUIDO, 'accent'],
      [StatusAtribuicao.EM_CONVERSA, 'accent'],
      [StatusAtribuicao.CONCLUIDO_SUCESSO, 'success'],
      [StatusAtribuicao.CONCLUIDO_RECUSADO, 'warn'],
    ] as const;

    cases.forEach(([status, expected]) => {
      it(`should return ${expected} for ${status}`, () => {
        const fixture = TestBed.createComponent(AssignedProcessCardComponent);
        fixture.componentRef.setInput('atribuicao', createAtribuicao({ status }));
        expect(fixture.componentInstance.statusColor).toBe(expected);
      });
    });
  });
});
