import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IngestionComponent } from './ingestion.component';
import { IngestionService } from '../../core/services/ingestion.service';
import { NotificationService } from '../../core/services/notification.service';
import { of, throwError } from 'rxjs';

describe('IngestionComponent', () => {
  let ingestionService: any;
  let notification: any;

  beforeEach(async () => {
    ingestionService = { sincronizar: vi.fn() };
    notification = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [IngestionComponent, NoopAnimationsModule],
      providers: [
        { provide: IngestionService, useValue: ingestionService },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(IngestionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default tribunais', () => {
    const fixture = TestBed.createComponent(IngestionComponent);
    expect(fixture.componentInstance.tribunais).toEqual(['TJSP', 'TRT2', 'TRT15']);
  });

  it('should have default form values', () => {
    const fixture = TestBed.createComponent(IngestionComponent);
    expect(fixture.componentInstance.formData.tribunal).toBe('TJSP');
    expect(fixture.componentInstance.formData.total).toBe(100);
    expect(fixture.componentInstance.formData.size).toBe(100);
  });

  it('should call sincronizar on submit with correct params', () => {
    ingestionService.sincronizar.mockReturnValue(of({ mensagem: 'OK' }));
    const fixture = TestBed.createComponent(IngestionComponent);
    fixture.componentInstance.onSubmit();
    expect(ingestionService.sincronizar).toHaveBeenCalledWith('TJSP', 100, 100);
    expect(notification.success).toHaveBeenCalledWith('OK');
  });

  it('should call sincronizar with custom form values', () => {
    ingestionService.sincronizar.mockReturnValue(of({ mensagem: 'OK' }));
    const fixture = TestBed.createComponent(IngestionComponent);
    fixture.componentInstance.formData = { tribunal: 'TRT2', total: 50, size: 20 };
    fixture.componentInstance.onSubmit();
    expect(ingestionService.sincronizar).toHaveBeenCalledWith('TRT2', 50, 20);
  });
});
