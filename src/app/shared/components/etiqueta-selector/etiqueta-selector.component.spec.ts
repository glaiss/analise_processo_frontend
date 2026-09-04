import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EtiquetaSelectorComponent } from './etiqueta-selector.component';
import { EtiquetaService } from '../../../core/services/etiqueta.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EtiquetaDialogComponent } from '../etiqueta-dialog/etiqueta-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { of, throwError } from 'rxjs';
import { EtiquetaDTO } from '../../../core/models/processo/etiqueta.model';

describe('EtiquetaSelectorComponent', () => {
  let component: EtiquetaSelectorComponent;
  let fixture: ComponentFixture<EtiquetaSelectorComponent>;
  let etiquetaServiceSpy: any;
  let notificationServiceSpy: any;
  let dialogSpy: any;

  const mockEtiquetas: EtiquetaDTO[] = [
    { id: '1', nome: 'Alta Prioridade', cor: '#F44336', tipo: 'GLOBAL', apelido: 'AP', usuarioNome: null },
    { id: '2', nome: 'Urgente', cor: '#E91E63', tipo: 'USUARIO', apelido: 'UR', usuarioNome: 'joao' },
    { id: '3', nome: 'Revisão', cor: '#2196F3', tipo: 'GLOBAL', apelido: 'RE', usuarioNome: null },
  ];

  const mockVinculadas: EtiquetaDTO[] = [
    { id: '1', nome: 'Alta Prioridade', cor: '#F44336', tipo: 'GLOBAL', apelido: 'AP', usuarioNome: null },
  ];

  beforeEach(async () => {
    etiquetaServiceSpy = {
      listar: vi.fn().mockReturnValue(of(mockEtiquetas)),
      listarPorProcesso: vi.fn().mockReturnValue(of(mockVinculadas)),
      vincularProcesso: vi.fn().mockReturnValue(of(void 0)),
      desvincularProcesso: vi.fn().mockReturnValue(of(void 0)),
    };
    notificationServiceSpy = {
      success: vi.fn(),
      error: vi.fn(),
    };
    dialogSpy = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: EtiquetaService, useValue: etiquetaServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    })
      .overrideComponent(EtiquetaSelectorComponent, {
        remove: { imports: [MatDialogModule] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EtiquetaSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('processoNumero', '1234567-89.2024.8.26.0000');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load etiquetas on init', () => {
      expect(etiquetaServiceSpy.listar).toHaveBeenCalled();
      expect(etiquetaServiceSpy.listarPorProcesso).toHaveBeenCalledWith('1234567-89.2024.8.26.0000');
    });

    it('should set etiquetas vinculadas', () => {
      expect(component.etiquetasVinculadas().length).toBe(1);
      expect(component.etiquetasVinculadas()[0].id).toBe('1');
    });

    it('should calculate available etiquetas', () => {
      expect(component.etiquetasDisponiveis().length).toBe(2);
      expect(component.etiquetasDisponiveis().map(e => e.id)).toEqual(['2', '3']);
    });
  });

  describe('abrirSelector', () => {
    it('should toggle selector visibility', () => {
      expect(component.mostrarSelector()).toBe(false);
      component.abrirSelector();
      expect(component.mostrarSelector()).toBe(true);
      component.abrirSelector();
      expect(component.mostrarSelector()).toBe(false);
    });
  });

  describe('fecharSelector', () => {
    it('should close selector', () => {
      component.abrirSelector();
      expect(component.mostrarSelector()).toBe(true);
      component.fecharSelector();
      expect(component.mostrarSelector()).toBe(false);
    });
  });

  describe('abrirGerenciador', () => {
    it('should open etiqueta dialog', () => {
      component.abrirGerenciador();
      expect(dialogSpy.open).toHaveBeenCalled();
      const [componentArg, configArg] = dialogSpy.open.mock.calls[0];
      expect(componentArg).toBe(EtiquetaDialogComponent);
      expect(configArg.width).toBe('480px');
      expect(configArg.disableClose).toBe(true);
    });

    it('should reload etiquetas after dialog closes', () => {
      component.abrirGerenciador();
      expect(etiquetaServiceSpy.listar).toHaveBeenCalledTimes(2);
    });
  });

  describe('vincular', () => {
    it('should link etiqueta to process', () => {
      const etiqueta = mockEtiquetas[1];
      component.vincular(etiqueta);
      expect(etiquetaServiceSpy.vincularProcesso).toHaveBeenCalledWith('1234567-89.2024.8.26.0000', ['2']);
    });

    it('should add etiqueta to vinculadas list', () => {
      const etiqueta = mockEtiquetas[1];
      component.vincular(etiqueta);
      expect(component.etiquetasVinculadas().length).toBe(2);
    });

    it('should close selector after vincular', () => {
      const etiqueta = mockEtiquetas[1];
      component.abrirSelector();
      component.vincular(etiqueta);
      expect(component.mostrarSelector()).toBe(false);
    });

    it('should handle error during vincular', () => {
      etiquetaServiceSpy.vincularProcesso.mockReturnValue(throwError(() => new Error('Erro')));
      const etiqueta = mockEtiquetas[1];
      component.vincular(etiqueta);
      expect(notificationServiceSpy.error).toHaveBeenCalledWith('Erro ao vincular etiqueta', 3000);
    });
  });

  describe('desvincular', () => {
    it('should open confirm dialog before desvincular', () => {
      const etiqueta = mockEtiquetas[0];
      component.desvincular(etiqueta);
      expect(dialogSpy.open).toHaveBeenCalled();
      const [componentArg, configArg] = dialogSpy.open.mock.calls[0];
      expect(componentArg).toBe(ConfirmDialogComponent);
      expect(configArg.data.title).toBe('Desvincular etiqueta');
      expect(configArg.data.message).toContain(etiqueta.nome);
    });

    it('should unlink etiqueta from process when confirmed', () => {
      const etiqueta = mockEtiquetas[0];
      component.desvincular(etiqueta);
      expect(etiquetaServiceSpy.desvincularProcesso).toHaveBeenCalledWith('1234567-89.2024.8.26.0000', '1');
    });

    it('should remove etiqueta from vinculadas list', () => {
      const etiqueta = mockEtiquetas[0];
      component.desvincular(etiqueta);
      expect(component.etiquetasVinculadas().length).toBe(0);
    });

    it('should not unlink when dialog is cancelled', () => {
      dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) });
      const etiqueta = mockEtiquetas[0];
      component.desvincular(etiqueta);
      expect(etiquetaServiceSpy.desvincularProcesso).not.toHaveBeenCalled();
      expect(component.etiquetasVinculadas().length).toBe(1);
    });

    it('should handle error during desvincular', () => {
      etiquetaServiceSpy.desvincularProcesso.mockReturnValue(throwError(() => new Error('Erro')));
      const etiqueta = mockEtiquetas[0];
      component.desvincular(etiqueta);
      expect(notificationServiceSpy.error).toHaveBeenCalledWith('Erro ao desvincular etiqueta', 3000);
    });
  });

  describe('template rendering', () => {
    it('should display section title', () => {
      const title = fixture.nativeElement.querySelector('.section-title');
      expect(title.textContent.trim()).toBe('Etiquetas');
    });

    it('should display vinculadas etiquetas', () => {
      const etiquetas = fixture.nativeElement.querySelectorAll('.etiqueta-item');
      expect(etiquetas.length).toBe(1);
    });

    it('should display settings button', () => {
      const settingsBtn = fixture.nativeElement.querySelector('button[matTooltip="Gerenciar etiquetas"]');
      expect(settingsBtn).toBeTruthy();
    });

    it('should display sell button', () => {
      const sellBtn = fixture.nativeElement.querySelector('button[matTooltip="Vincular etiqueta"]');
      expect(sellBtn).toBeTruthy();
    });
  });
});
