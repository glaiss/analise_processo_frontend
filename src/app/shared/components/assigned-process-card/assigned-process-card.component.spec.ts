import { TestBed } from '@angular/core/testing';
import { AssignedProcessCardComponent } from './assigned-process-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AtribuicaoProcessoResumoDTO } from '../../../core/models/processo/atribuicao-processo-resumo.model';
import { ProcessoSituacao, StatusAtribuicao, TipologiaProcesso } from '../../../core/models/processo/enums.model';
import { of, throwError } from 'rxjs';

function createAtribuicao(overrides?: Partial<AtribuicaoProcessoResumoDTO>): AtribuicaoProcessoResumoDTO {
  return {
    id: '1',
    status: StatusAtribuicao.ATRIBUIDO,
    resultadoAtendimento: null,
    statusPrazo: 'PENDENTE',
    prazoFinal: null,
    diasPendentes: null,
    prazoVencendo: false,
    processoNumero: '0000001-12.2023.8.26.0100',
    processoTribunal: 'TJSP',
    processoOrgaoJulgadorNome: '1ª Vara Cível',
    processoDataAjuizamento: '2023-01-15T10:00:00',
    processoValorCausa: 50000,
    processoSituacao: ProcessoSituacao.ENRIQUECIDO,
    processoTipologia: TipologiaProcesso.JEC,
    processoScoreFinal: 85,
    processoEnriquecimentoStatus: 'CONCLUIDO',
    processoEnriquecimentoErro: '',
    equipeNome: 'Equipe A',
    usuarioNome: 'João Silva',
    monitorado: false,
    isLido: false,
    ...overrides,
  };
}

describe('AssignedProcessCardComponent', () => {
  let processState: any;
  let notification: any;
  let router: any;

  beforeEach(async () => {
    processState = { alternarMonitoramento: vi.fn(), marcarComoLido: vi.fn().mockReturnValue(of(void 0)) };
    notification = { success: vi.fn(), error: vi.fn() };
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

  describe('showUsuario', () => {
    it('should render responsible user when true', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ usuarioNome: 'Maria Souza' }));
      fixture.componentRef.setInput('showUsuario', true);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Responsável');
      expect(text).toContain('Maria Souza');
    });

    it('should not render responsible user when false', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ usuarioNome: 'Maria Souza' }));
      fixture.componentRef.setInput('showUsuario', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('Responsável');
      expect(fixture.nativeElement.textContent).not.toContain('Maria Souza');
    });
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
      processState.alternarMonitoramento.mockReturnValue(throwError(() => new Error('Falha')));

      fixture.componentInstance.toggleMonitoramento(new MouseEvent('click'));
      expect(atribuicao.monitorado).toBe(false);
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
    it('should return empty for score > 100', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ processoScoreFinal: 150 }));
      expect(fixture.componentInstance.scoreColor).toBe('');
    });

    it('should return primary for score between 51 and 100', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ processoScoreFinal: 75 }));
      expect(fixture.componentInstance.scoreColor).toBe('primary');
    });

    it('should return accent for score <= 50', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ processoScoreFinal: 30 }));
      expect(fixture.componentInstance.scoreColor).toBe('accent');
    });
  });

  describe('prazoDisplayText', () => {
    it('should return empty when there is no prazo', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: null }));
      expect(fixture.componentInstance.prazoDisplayText).toBe('');
    });

    it('should return Cumprido when status is CUMPRIDO', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ statusPrazo: 'CUMPRIDO', prazoFinal: '2026-09-10T00:00:00' }));
      expect(fixture.componentInstance.prazoDisplayText).toBe('Cumprido');
    });

    it('should return overdue for negative diasPendentes', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-01-01T00:00:00', diasPendentes: -3 }));
      expect(fixture.componentInstance.prazoDisplayText).toBe('3 dia(s) em atraso');
    });

    it('should return Vence hoje for zero', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-13T00:00:00', diasPendentes: 0 }));
      expect(fixture.componentInstance.prazoDisplayText).toBe('Vence hoje');
    });

    it('should return Vence em 1 dia for one', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-14T00:00:00', diasPendentes: 1 }));
      expect(fixture.componentInstance.prazoDisplayText).toBe('Vence em 1 dia');
    });

    it('should return Vence em X dias for two or more', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-20T00:00:00', diasPendentes: 7 }));
      expect(fixture.componentInstance.prazoDisplayText).toBe('Vence em 7 dias');
    });
  });

  describe('prazoDaysColor', () => {
    it('should return success for CUMPRIDO', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ statusPrazo: 'CUMPRIDO', prazoFinal: '2026-09-10T00:00:00' }));
      expect(fixture.componentInstance.prazoDaysColor).toBe('success');
    });

    it('should return warn for zero or negative days', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-13T00:00:00', diasPendentes: 0 }));
      expect(fixture.componentInstance.prazoDaysColor).toBe('warn');
    });

    it('should return warn for one day', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-14T00:00:00', diasPendentes: 1 }));
      expect(fixture.componentInstance.prazoDaysColor).toBe('warn');
    });

    it('should return accent for two days', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-15T00:00:00', diasPendentes: 2 }));
      expect(fixture.componentInstance.prazoDaysColor).toBe('accent');
    });

    it('should return neutral for three or more days', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-16T00:00:00', diasPendentes: 3 }));
      expect(fixture.componentInstance.prazoDaysColor).toBe('neutral');
    });

    it('should return neutral when diasPendentes is null', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({ prazoFinal: '2026-08-16T00:00:00', diasPendentes: null }));
      expect(fixture.componentInstance.prazoDaysColor).toBe('neutral');
    });
  });

  describe('openDetails', () => {
    it('should navigate to processo details', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao());

      void fixture.componentInstance.openDetails(new MouseEvent('click'));
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

    it('should return basic for unknown status', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({
        status: 'UNKNOWN' as any,
      }));
      expect(fixture.componentInstance.statusColor).toBe('basic');
    });
  });

  describe('toggleSelection', () => {
    it('should toggle selected from false to true and emit', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao());
      fixture.componentRef.setInput('selected', false);

      const emitSpy = vi.spyOn(fixture.componentInstance.selectedChange, 'emit');
      fixture.componentInstance.toggleSelection(new MouseEvent('click'));

      expect(fixture.componentInstance.selected).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should toggle selected from true to false and emit', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao());
      fixture.componentRef.setInput('selected', true);

      const emitSpy = vi.spyOn(fixture.componentInstance.selectedChange, 'emit');
      fixture.componentInstance.toggleSelection(new MouseEvent('click'));

      expect(fixture.componentInstance.selected).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('situationColorClass', () => {
    const situationCases: Array<[string, string]> = [
      ['AGUARDANDO_DISTRIBUICAO', 'situation-pending'],
      ['PENDENTE_ENRIQUECIMENTO', 'situation-pending'],
      ['EM_ENRIQUECIMENTO', 'situation-processing'],
      ['ENRIQUECIDO', 'situation-ready'],
      ['DESCARTADO_SCORE_BAIXO', 'situation-discarded'],
      ['PROPOSTA_APRESENTADA', 'situation-proposal'],
      ['FINALIZADO', 'situation-finished'],
      ['ERRO_PROCESSAMENTO', 'situation-error'],
    ];

    situationCases.forEach(([situacao, expectedClass]) => {
      it(`should return ${expectedClass} for ${situacao}`, () => {
        const fixture = TestBed.createComponent(AssignedProcessCardComponent);
        fixture.componentRef.setInput('atribuicao', createAtribuicao({
          processoSituacao: situacao as any,
        }));
        expect(fixture.componentInstance.situationColorClass).toBe(expectedClass);
      });
    });

    it('should return empty string for unknown situation', () => {
      const fixture = TestBed.createComponent(AssignedProcessCardComponent);
      fixture.componentRef.setInput('atribuicao', createAtribuicao({
        processoSituacao: 'UNKNOWN' as any,
      }));
      expect(fixture.componentInstance.situationColorClass).toBe('');
    });
  });
});
