import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ProcessStateService } from '../../core/services/process-state.service';
import { EtiquetaService } from '../../core/services/etiqueta.service';
import { TipologiaProcesso } from '../../core/models/processo/enums.model';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProcessStateService, useValue: { loadProcesses: vi.fn() } },
        { provide: EtiquetaService, useValue: { listar: () => of([]) } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  }, 15000);

  it('should have default viewMode as meus', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance.viewMode()).toBe('meus');
  });

  it('should update viewMode on onChangeViewMode', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.onViewModeChange({ value: 'equipe' });
    expect(fixture.componentInstance.viewMode()).toBe('equipe');
  });

  it('should switch back to meus', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.onViewModeChange({ value: 'equipe' });
    fixture.componentInstance.onViewModeChange({ value: 'meus' });
    expect(fixture.componentInstance.viewMode()).toBe('meus');
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are active', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(false);
    });

    it('should return true when searchQuery is set', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.searchQuery.set('123');
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedNiveis has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedNiveis.set(['ALTO']);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedStatus has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedStatus.set(['ATRIBUIDO']);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedSituacao has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedSituacao.set(['ENRIQUECIDO']);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedAssunto is set', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedAssunto.set('tributário');
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedTipologia has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedTipologia.set([TipologiaProcesso.JEC]);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when selectedEtiquetas has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedEtiquetas.set(['uuid-1']);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when autorSemAdvogado is checked', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.autorSemAdvogado.set(true);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });

    it('should return true when partesSemAdvogado is checked', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.partesSemAdvogado.set(true);
      expect(fixture.componentInstance.hasActiveFilters()).toBe(true);
    });
  });

  describe('filterParams', () => {
    it('should return undefined when no filters are active', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      expect(fixture.componentInstance.filterParams()).toBeUndefined();
    });

    it('should include numero when searchQuery is set', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.searchQuery.set('0001234');
      expect(fixture.componentInstance.filterParams()?.numero).toBe('0001234');
    });

    it('should include niveis when selectedNiveis has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedNiveis.set(['ALTO', 'MEDIO']);
      expect(fixture.componentInstance.filterParams()?.niveis).toEqual(['ALTO', 'MEDIO']);
    });

    it('should include status when selectedStatus has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedStatus.set(['ATRIBUIDO']);
      expect(fixture.componentInstance.filterParams()?.status).toEqual(['ATRIBUIDO']);
    });

    it('should include situacao when selectedSituacao has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedSituacao.set(['ENRIQUECIDO']);
      expect(fixture.componentInstance.filterParams()?.situacao).toEqual(['ENRIQUECIDO']);
    });

    it('should include assunto when selectedAssunto is set', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedAssunto.set('tributário');
      expect(fixture.componentInstance.filterParams()?.assunto).toBe('tributário');
    });

    it('should include processosTipologia when selectedTipologia has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedTipologia.set([TipologiaProcesso.JEC, TipologiaProcesso.PENAL]);
      expect(fixture.componentInstance.filterParams()?.processosTipologia).toEqual([TipologiaProcesso.JEC, TipologiaProcesso.PENAL]);
    });

    it('should omit numero when searchQuery is empty string', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedNiveis.set(['ALTO']);
      const params = fixture.componentInstance.filterParams();
      expect(params?.numero).toBeUndefined();
      expect(params?.niveis).toEqual(['ALTO']);
    });

    it('should include etiquetas when selectedEtiquetas has items', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.selectedEtiquetas.set(['uuid-1', 'uuid-2']);
      expect(fixture.componentInstance.filterParams()?.etiquetas).toEqual(['uuid-1', 'uuid-2']);
    });

    it('should include advogado flags when checked', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.autorSemAdvogado.set(true);
      fixture.componentInstance.partesSemAdvogado.set(true);
      const params = fixture.componentInstance.filterParams();
      expect(params?.autorSemAdvogado).toBe(true);
      expect(params?.partesSemAdvogado).toBe(true);
      expect(params?.autorComAdvogado).toBeUndefined();
      expect(params?.semAdvogado).toBeUndefined();
    });
  });

  describe('onFilterChange', () => {
    it('should update all signals from filter event', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.onFilterChange({
        searchQuery: '123',
        selectedNiveis: ['ALTO'],
        selectedStatus: ['ATRIBUIDO'],
        selectedSituacao: ['ENRIQUECIDO'],
        selectedAssunto: 'tributário',
        selectedTipologia: [TipologiaProcesso.JEC],
        selectedEtiquetas: ['uuid-1'],
        autorComAdvogado: false,
        autorSemAdvogado: true,
        partesComAdvogado: false,
        partesSemAdvogado: true,
        semAdvogado: false,
      });
      expect(fixture.componentInstance.searchQuery()).toBe('123');
      expect(fixture.componentInstance.selectedNiveis()).toEqual(['ALTO']);
      expect(fixture.componentInstance.selectedStatus()).toEqual(['ATRIBUIDO']);
      expect(fixture.componentInstance.selectedSituacao()).toEqual(['ENRIQUECIDO']);
      expect(fixture.componentInstance.selectedAssunto()).toBe('tributário');
      expect(fixture.componentInstance.selectedTipologia()).toEqual([TipologiaProcesso.JEC]);
      expect(fixture.componentInstance.selectedEtiquetas()).toEqual(['uuid-1']);
      expect(fixture.componentInstance.autorSemAdvogado()).toBe(true);
      expect(fixture.componentInstance.partesSemAdvogado()).toBe(true);
      expect(fixture.componentInstance.autorComAdvogado()).toBe(false);
    });
  });

  describe('onClearFilters', () => {
    it('should reset all filter signals', () => {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.componentInstance.searchQuery.set('123');
      fixture.componentInstance.selectedNiveis.set(['ALTO']);
      fixture.componentInstance.selectedStatus.set(['ATRIBUIDO']);
      fixture.componentInstance.selectedSituacao.set(['ENRIQUECIDO']);
      fixture.componentInstance.selectedAssunto.set('tributário');
      fixture.componentInstance.selectedTipologia.set([TipologiaProcesso.JEC]);
      fixture.componentInstance.selectedEtiquetas.set(['uuid-1']);
      fixture.componentInstance.autorComAdvogado.set(true);
      fixture.componentInstance.autorSemAdvogado.set(true);
      fixture.componentInstance.partesComAdvogado.set(true);
      fixture.componentInstance.partesSemAdvogado.set(true);
      fixture.componentInstance.semAdvogado.set(true);
      fixture.componentInstance.onClearFilters();
      expect(fixture.componentInstance.searchQuery()).toBe('');
      expect(fixture.componentInstance.selectedNiveis()).toEqual([]);
      expect(fixture.componentInstance.selectedStatus()).toEqual([]);
      expect(fixture.componentInstance.selectedSituacao()).toEqual([]);
      expect(fixture.componentInstance.selectedAssunto()).toBe('');
      expect(fixture.componentInstance.selectedTipologia()).toEqual([]);
      expect(fixture.componentInstance.selectedEtiquetas()).toEqual([]);
      expect(fixture.componentInstance.autorComAdvogado()).toBe(false);
      expect(fixture.componentInstance.autorSemAdvogado()).toBe(false);
      expect(fixture.componentInstance.partesComAdvogado()).toBe(false);
      expect(fixture.componentInstance.partesSemAdvogado()).toBe(false);
      expect(fixture.componentInstance.semAdvogado()).toBe(false);
    });
  });
});
