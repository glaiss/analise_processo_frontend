import { TestBed } from '@angular/core/testing';
import { ProcessSidebarListComponent } from './process-sidebar-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
});
