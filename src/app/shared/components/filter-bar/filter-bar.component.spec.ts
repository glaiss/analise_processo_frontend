import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterBarComponent } from './filter-bar.component';

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
    expect(fixture.componentInstance.showAdvanced()).toBe(false);
  });

  it('should emit search on onSearch', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.search, 'emit');
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
    fixture.componentInstance.showAdvanced.set(true);

    const emitSpy = vi.spyOn(fixture.componentInstance.clearFilters, 'emit');
    fixture.componentInstance.onClear();

    expect(fixture.componentInstance.searchQuery()).toBe('');
    expect(fixture.componentInstance.selectedNiveis()).toEqual([]);
    expect(fixture.componentInstance.selectedStatus()).toEqual([]);
    expect(fixture.componentInstance.selectedSituacao()).toEqual([]);
    expect(fixture.componentInstance.selectedAssunto()).toBe('');
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

  it('should emit search on onAssuntoSearch', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.search, 'emit');
    fixture.componentInstance.onAssuntoSearch();
    expect(emitSpy).toHaveBeenCalled();
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
    const emitSpy = vi.spyOn(fixture.componentInstance.search, 'emit');
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
});
