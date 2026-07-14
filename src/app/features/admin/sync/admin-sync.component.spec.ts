import { TestBed } from '@angular/core/testing';
import { AdminSyncComponent } from './admin-sync.component';
import { AdminSyncService } from '../../../core/services/admin-sync.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('AdminSyncComponent', () => {
  let mockSyncService: Partial<AdminSyncService>;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    mockSyncService = {
      syncMovimentos: vi.fn().mockReturnValue(of({ status: 'ok', mensagem: 'Movimentos sincronizados' })),
      syncClasses: vi.fn().mockReturnValue(of({ status: 'ok', mensagem: 'Classes sincronizadas' })),
      syncAssuntos: vi.fn().mockReturnValue(of({ status: 'ok', mensagem: 'Assuntos sincronizados' })),
      syncTudo: vi.fn().mockReturnValue(of({ status: 'ok', mensagem: 'Tudo sincronizado' })),
      syncIngestao: vi.fn().mockReturnValue(of({ status: 'ok', mensagem: 'Ingestão iniciada' })),
    };

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminSyncComponent, NoopAnimationsModule],
      providers: [
        { provide: AdminSyncService, useValue: mockSyncService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default tribunais', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    expect(fixture.componentInstance.tribunais).toEqual(['TJSP', 'TRT2', 'TRT15']);
  });

  it('should have default ingestaoForm values', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    expect(fixture.componentInstance.ingestaoForm.tribunal).toBe('TJSP');
    expect(fixture.componentInstance.ingestaoForm.total).toBe(100);
    expect(fixture.componentInstance.ingestaoForm.size).toBe(100);
  });

  it('syncMovimentos should call service and show success', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    fixture.componentInstance.syncMovimentos();
    expect(mockSyncService.syncMovimentos).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith('Movimentos sincronizados');
  });

  it('syncClasses should call service and show success', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    fixture.componentInstance.syncClasses();
    expect(mockSyncService.syncClasses).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith('Classes sincronizadas');
  });

  it('syncAssuntos should call service and show success', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    fixture.componentInstance.syncAssuntos();
    expect(mockSyncService.syncAssuntos).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith('Assuntos sincronizados');
  });

  it('syncTudo should call service and show success', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    fixture.componentInstance.syncTudo();
    expect(mockSyncService.syncTudo).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith('Tudo sincronizado');
  });

  it('syncIngestao should call service with form values and show success', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    fixture.componentInstance.ingestaoForm.tribunal = 'TRT2';
    fixture.componentInstance.ingestaoForm.total = 50;
    fixture.componentInstance.ingestaoForm.size = 10;
    fixture.componentInstance.syncIngestao();
    expect(mockSyncService.syncIngestao).toHaveBeenCalledWith('TRT2', 50, 10);
    expect(mockNotification.success).toHaveBeenCalledWith('Ingestão iniciada');
  });

  it('should render sync buttons', () => {
    const fixture = TestBed.createComponent(AdminSyncComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
