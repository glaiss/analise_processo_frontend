import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReprocessarComponent } from './reprocessar.component';
import { EnriquecimentoService } from '../../core/services/enriquecimento.service';
import { NotificationService } from '../../core/services/notification.service';
import { of, throwError } from 'rxjs';

describe('ReprocessarComponent', () => {
  let service: any;
  let notification: any;

  beforeEach(async () => {
    service = { processar: vi.fn(), reprocessar: vi.fn() };
    notification = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReprocessarComponent, NoopAnimationsModule],
      providers: [
        { provide: EnriquecimentoService, useValue: service },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReprocessarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call processar on executarProcessamento success', () => {
    service.processar.mockReturnValue(of(undefined));
    const fixture = TestBed.createComponent(ReprocessarComponent);
    fixture.componentInstance.executarProcessamento();
    expect(service.processar).toHaveBeenCalled();
    expect(notification.success).toHaveBeenCalledWith('Processamento iniciado com sucesso', 3000);
  });

  it('should show error on processar failure', () => {
    service.processar.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ReprocessarComponent);
    fixture.componentInstance.executarProcessamento();
    expect(notification.error).toHaveBeenCalledWith('Erro ao iniciar processamento', 3000);
  });

  it('should call reprocessar on executarReprocessamento success', () => {
    service.reprocessar.mockReturnValue(of(undefined));
    const fixture = TestBed.createComponent(ReprocessarComponent);
    fixture.componentInstance.executarReprocessamento();
    expect(service.reprocessar).toHaveBeenCalled();
    expect(notification.success).toHaveBeenCalledWith('Reprocessamento iniciado com sucesso', 3000);
  });

  it('should show error on reprocessar failure', () => {
    service.reprocessar.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ReprocessarComponent);
    fixture.componentInstance.executarReprocessamento();
    expect(notification.error).toHaveBeenCalledWith('Erro ao iniciar reprocessamento', 3000);
  });

  it('should manage loading state during processamento', () => {
    service.processar.mockReturnValue(of(undefined));
    const fixture = TestBed.createComponent(ReprocessarComponent);

    expect(fixture.componentInstance.loading()).toBe(false);
    fixture.componentInstance.executarProcessamento();
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should reset loading state on processamento error', () => {
    service.processar.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ReprocessarComponent);
    fixture.componentInstance.executarProcessamento();
    expect(fixture.componentInstance.loading()).toBe(false);
  });
});
