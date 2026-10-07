import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterBarComponent } from './filter-bar.component';
import { TipologiaProcesso } from '../../../core/models/processo/enums.model';

describe('FilterBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBarComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance.searchQuery()).toBe('');
    expect(fixture.componentInstance.selectedNiveis()).toEqual([]);
    expect(fixture.componentInstance.selectedStatus()).toEqual([]);
    expect(fixture.componentInstance.selectedSituacao()).toEqual([]);
    expect(fixture.componentInstance.selectedAssunto()).toBe('');
    expect(fixture.componentInstance.selectedTipologia()).toEqual([]);
    expect(fixture.componentInstance.showAdvanced()).toBe(false);
  });

  it('should emit search on onSearch', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');
    fixture.componentInstance.onSearch();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should reset all filters and emit clearFilters on onClear', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
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
    fixture.componentInstance.showAdvanced.set(true);

    const emitSpy = vi.spyOn(fixture.componentInstance.clearFilters, 'emit');
    fixture.componentInstance.onClear();

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
    expect(fixture.componentInstance.showAdvanced()).toBe(false);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should update selectedStatus on onStatusChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.onStatusChange(['ATRIBUIDO', 'DISPONIVEL']);
    expect(fixture.componentInstance.selectedStatus()).toEqual(['ATRIBUIDO', 'DISPONIVEL']);
  });

  it('should update selectedSituacao on onSituacaoChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.onSituacaoChange(['ENRIQUECIDO']);
    expect(fixture.componentInstance.selectedSituacao()).toEqual(['ENRIQUECIDO']);
  });

  it('should update selectedNiveis on onScoreChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.onScoreChange(['ALTO', 'INTERMEDIARIO_BAIXO']);
    expect(fixture.componentInstance.selectedNiveis()).toEqual(['ALTO', 'INTERMEDIARIO_BAIXO']);
  });

  it('should update selectedTipologia on onTipologiaChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.onTipologiaChange([TipologiaProcesso.JEC, TipologiaProcesso.PENAL]);
    expect(fixture.componentInstance.selectedTipologia()).toEqual([TipologiaProcesso.JEC, TipologiaProcesso.PENAL]);
  });

  it('should emit search on onAssuntoSearch', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');
    fixture.componentInstance.onAssuntoSearch();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should debounce assunto search until 3s after typing stops', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(FilterBarComponent);
      const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');

      fixture.componentInstance.onAssuntoInput('trib');
      expect(fixture.componentInstance.selectedAssunto()).toBe('trib');
      expect(emitSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);
      expect(emitSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ selectedAssunto: 'trib' }));
    } finally {
      vi.useRealTimers();
    }
  });

  it('should reset debounce timer when user keeps typing', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(FilterBarComponent);
      const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');

      fixture.componentInstance.onAssuntoInput('tri');
      vi.advanceTimersByTime(2500);
      fixture.componentInstance.onAssuntoInput('trib');
      vi.advanceTimersByTime(2500);
      expect(emitSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ selectedAssunto: 'trib' }));
    } finally {
      vi.useRealTimers();
    }
  });

  it('should emit immediately on onAssuntoSearch and cancel pending debounce', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(FilterBarComponent);
      const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');

      fixture.componentInstance.onAssuntoInput('trib');
      fixture.componentInstance.onAssuntoSearch();
      expect(emitSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(3000);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should toggle showAdvanced', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance.showAdvanced()).toBe(false);
    fixture.componentInstance.toggleAdvanced();
    expect(fixture.componentInstance.showAdvanced()).toBe(true);
    fixture.componentInstance.toggleAdvanced();
    expect(fixture.componentInstance.showAdvanced()).toBe(false);
  });

  it('should expose status enum values', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance.statusOptions.length).toBeGreaterThan(0);
  });

  it('should expose situacao enum values', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance.situacaoOptions.length).toBeGreaterThan(0);
  });

  it('should expose tipologia enum values', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance.tipologiaOptions).toEqual(['TRABALHISTA_BASE', 'TRABALHISTA_RECLAMANTE', 'TRABALHISTA_RECLAMADA', 'JEC', 'PENAL', 'JEFAZ', 'GENERICO']);
  });

  it('should expose all score types', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    expect(fixture.componentInstance.scoreOptions).toEqual(['ALTO', 'INTERMEDIARIO_ALTO', 'MEDIO', 'INTERMEDIARIO_BAIXO', 'MINIMO']);
  });

  it('should show search input', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[matInput]');
    expect(input).toBeTruthy();
  });

  it('should show advanced filters when showAdvanced is true', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.showAdvanced.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters-extra')).toBeTruthy();
  });

  it('should hide advanced filters when showAdvanced is false', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters-extra')).toBeFalsy();
  });

  it('should show clear filters button when hasActiveFilters is true', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentRef.setInput('hasActiveFilters', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.clear-filters-btn')).toBeTruthy();
  });

  it('should hide clear filters button when hasActiveFilters is false', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentRef.setInput('hasActiveFilters', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.clear-filters-btn')).toBeFalsy();
  });

  it('should show clear search button when searchQuery has a value', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.searchQuery.set('12345');
    fixture.detectChanges();
    const warnIcons = fixture.nativeElement.querySelectorAll('.search-field mat-icon[color="warn"]');
    expect(warnIcons.length).toBe(1);
    expect(warnIcons[0].textContent).toContain('close');
  });

  it('should clear searchQuery and emit search when close button clicked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.searchQuery.set('12345');
    fixture.detectChanges();
    const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');
    const warnIcons = fixture.nativeElement.querySelectorAll('.search-field mat-icon[color="warn"]');
    const clearBtn = warnIcons[0].closest('button') as HTMLElement;
    clearBtn.click();
    expect(fixture.componentInstance.searchQuery()).toBe('');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should show clear assunto button when selectedAssunto has a value', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.showAdvanced.set(true);
    fixture.componentInstance.selectedAssunto.set('tributário');
    fixture.detectChanges();
    const warnIcons = fixture.nativeElement.querySelectorAll('.full-width mat-icon[color="warn"]');
    expect(warnIcons.length).toBe(1);
    expect(warnIcons[0].textContent).toContain('close');
  });

  it('should update selectedEtiquetas on onEtiquetasChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');
    fixture.componentInstance.onEtiquetasChange(['uuid-1', 'uuid-2']);
    expect(fixture.componentInstance.selectedEtiquetas()).toEqual(['uuid-1', 'uuid-2']);
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ selectedEtiquetas: ['uuid-1', 'uuid-2'] }));
  });

  it('should clear semAdvogado when autorComAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.semAdvogado.set(true);
    fixture.componentInstance.onAutorComAdvogadoChange(true);
    expect(fixture.componentInstance.autorComAdvogado()).toBe(true);
    expect(fixture.componentInstance.semAdvogado()).toBe(false);
  });

  it('should clear autorSemAdvogado when autorComAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.autorSemAdvogado.set(true);
    fixture.componentInstance.onAutorComAdvogadoChange(true);
    expect(fixture.componentInstance.autorComAdvogado()).toBe(true);
    expect(fixture.componentInstance.autorSemAdvogado()).toBe(false);
  });

  it('should clear autorComAdvogado when autorSemAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.autorComAdvogado.set(true);
    fixture.componentInstance.onAutorSemAdvogadoChange(true);
    expect(fixture.componentInstance.autorSemAdvogado()).toBe(true);
    expect(fixture.componentInstance.autorComAdvogado()).toBe(false);
  });

  it('should keep partesSemAdvogado when autorSemAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.partesSemAdvogado.set(true);
    fixture.componentInstance.onAutorSemAdvogadoChange(true);
    expect(fixture.componentInstance.autorSemAdvogado()).toBe(true);
    expect(fixture.componentInstance.partesSemAdvogado()).toBe(true);
  });

  it('should clear semAdvogado when partesComAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.semAdvogado.set(true);
    fixture.componentInstance.onPartesComAdvogadoChange(true);
    expect(fixture.componentInstance.partesComAdvogado()).toBe(true);
    expect(fixture.componentInstance.semAdvogado()).toBe(false);
  });

  it('should keep partesComAdvogado when partesSemAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.partesComAdvogado.set(true);
    fixture.componentInstance.onPartesSemAdvogadoChange(true);
    expect(fixture.componentInstance.partesSemAdvogado()).toBe(true);
    expect(fixture.componentInstance.partesComAdvogado()).toBe(true);
  });

  it('should clear positive advogado filters when semAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.autorComAdvogado.set(true);
    fixture.componentInstance.partesComAdvogado.set(true);
    fixture.componentInstance.onSemAdvogadoChange(true);
    expect(fixture.componentInstance.semAdvogado()).toBe(true);
    expect(fixture.componentInstance.autorComAdvogado()).toBe(false);
    expect(fixture.componentInstance.partesComAdvogado()).toBe(false);
  });

  it('should keep negative advogado filters when semAdvogado is checked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.autorSemAdvogado.set(true);
    fixture.componentInstance.partesSemAdvogado.set(true);
    fixture.componentInstance.onSemAdvogadoChange(true);
    expect(fixture.componentInstance.semAdvogado()).toBe(true);
    expect(fixture.componentInstance.autorSemAdvogado()).toBe(true);
    expect(fixture.componentInstance.partesSemAdvogado()).toBe(true);
  });

  it('should emit advogado flags on filterChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');
    fixture.componentInstance.onAutorComAdvogadoChange(true);
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ autorComAdvogado: true, semAdvogado: false }));
  });

  it('should emit new advogado flags on filterChange', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.filterChange, 'emit');
    fixture.componentInstance.onAutorSemAdvogadoChange(true);
    fixture.componentInstance.onPartesSemAdvogadoChange(true);
    expect(emitSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      autorSemAdvogado: true,
      partesSemAdvogado: true,
      autorComAdvogado: false,
    }));
  });

  it('should hide processo filters when showProcessoFilters is false', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.showAdvanced.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.processo-filters-row')).toBeFalsy();
  });

  it('should show processo filters when showProcessoFilters is true', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.componentInstance.showAdvanced.set(true);
    fixture.componentRef.setInput('showProcessoFilters', true);
    fixture.componentRef.setInput('etiquetasOptions', [
      { id: 'uuid-1', nome: 'Urgente', cor: '#FF0000', tipo: 'GLOBAL', apelido: 'Urgente', usuarioNome: null },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.processo-filters-row')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(5);
  });
});
