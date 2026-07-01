import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard.component';
import { ProcessStateService } from '../../core/services/process-state.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProcessStateService, useValue: { loadProcesses: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

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
});
