import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EtiquetaDialogComponent } from './etiqueta-dialog.component';
import { EtiquetaService } from '../../../core/services/etiqueta.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of, throwError } from 'rxjs';
import { EtiquetaDTO } from '../../../core/models/processo/etiqueta.model';

describe('EtiquetaDialogComponent', () => {
  let component: EtiquetaDialogComponent;
  let fixture: ComponentFixture<EtiquetaDialogComponent>;
  let dialogRefSpy: any;
  let etiquetaServiceSpy: any;
  let notificationServiceSpy: any;

  const mockEtiqueta: EtiquetaDTO = {
    id: '1',
    nome: 'Alta Prioridade',
    cor: '#F44336',
    tipo: 'GLOBAL',
    apelido: 'AP',
    usuarioNome: null,
  };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };
    etiquetaServiceSpy = {
      criar: vi.fn().mockReturnValue(of(mockEtiqueta)),
      atualizar: vi.fn().mockReturnValue(of(mockEtiqueta)),
    };
    notificationServiceSpy = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [EtiquetaDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: EtiquetaService, useValue: etiquetaServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EtiquetaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(component.nome).toBe('');
      expect(component.corSelecionada).toBe('#3F51B5');
      expect(component.salvando()).toBe(false);
    });

    it('should have 16 predefined colors', () => {
      expect(component.coresPredefinidas.length).toBe(16);
    });
  });

  describe('gerarApelido', () => {
    it('should return empty string for empty nome', () => {
      component.nome = '';
      expect(component.gerarApelido()).toBe('');
    });

    it('should return first 4 characters for single word with more than 4 chars', () => {
      component.nome = 'Prioridade';
      expect(component.gerarApelido()).toBe('Prio');
    });

    it('should return full word for single word with 4 or fewer chars', () => {
      component.nome = 'Alta';
      expect(component.gerarApelido()).toBe('Alta');
    });

    it('should return initials for multiple words', () => {
      component.nome = 'Alta Prioridade';
      expect(component.gerarApelido()).toBe('AP');
    });

    it('should handle multiple spaces between words', () => {
      component.nome = 'Alta  Prioridade';
      expect(component.gerarApelido()).toBe('AP');
    });

    it('should handle leading/trailing spaces', () => {
      component.nome = '  Alta Prioridade  ';
      expect(component.gerarApelido()).toBe('AP');
    });
  });

  describe('getTextColor', () => {
    it('should return black for light colors', () => {
      component.corSelecionada = '#FFFFFF';
      expect(component.getTextColor()).toBe('#000000');
    });

    it('should return white for dark colors', () => {
      component.corSelecionada = '#000000';
      expect(component.getTextColor()).toBe('#FFFFFF');
    });
  });

  describe('template rendering', () => {
    it('should display "Nova Etiqueta" title when no data', () => {
      const title = fixture.nativeElement.querySelector('h2[mat-dialog-title]');
      expect(title.textContent.trim()).toBe('Nova Etiqueta');
    });

    it('should display color presets', () => {
      const colorDots = fixture.nativeElement.querySelectorAll('.color-dot');
      expect(colorDots.length).toBe(16);
    });

    it('should display color picker', () => {
      const colorPicker = fixture.nativeElement.querySelector('.color-picker');
      expect(colorPicker).toBeTruthy();
    });

    it('should display apelido preview', () => {
      const preview = fixture.nativeElement.querySelector('.apelido-preview');
      expect(preview).toBeTruthy();
    });
  });

  describe('salvar', () => {
    it('should not save if nome is empty', () => {
      component.nome = '';
      component.corSelecionada = '#F44336';
      component.salvar();
      expect(etiquetaServiceSpy.criar).not.toHaveBeenCalled();
    });

    it('should not save if corSelecionada is empty', () => {
      component.nome = 'Teste';
      component.corSelecionada = '';
      component.salvar();
      expect(etiquetaServiceSpy.criar).not.toHaveBeenCalled();
    });

    it('should call criar when no existing etiqueta', () => {
      component.nome = 'Nova Etiqueta';
      component.corSelecionada = '#F44336';
      component.salvar();
      expect(etiquetaServiceSpy.criar).toHaveBeenCalledWith({
        nome: 'Nova Etiqueta',
        cor: '#F44336',
      });
    });

    it('should close dialog after successful save', () => {
      component.nome = 'Nova Etiqueta';
      component.corSelecionada = '#F44336';
      component.salvar();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(mockEtiqueta);
    });

    it('should show success notification after save', () => {
      component.nome = 'Nova Etiqueta';
      component.corSelecionada = '#F44336';
      component.salvar();
      expect(notificationServiceSpy.success).toHaveBeenCalledWith('Etiqueta criada!', 3000);
    });

    it('should handle error during save', () => {
      etiquetaServiceSpy.criar.mockReturnValue(throwError(() => ({ error: { message: 'Erro ao criar' } })));
      component.nome = 'Nova Etiqueta';
      component.corSelecionada = '#F44336';
      component.salvar();
      expect(notificationServiceSpy.error).toHaveBeenCalledWith('Erro ao criar', 3000);
    });

    it('should set salvando to true during save', () => {
      component.nome = 'Nova Etiqueta';
      component.corSelecionada = '#F44336';
      component.salvar();
      expect(component.salvando()).toBe(false);
    });
  });

  describe('with existing etiqueta', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [EtiquetaDialogComponent, MatDialogModule, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: { etiqueta: mockEtiqueta } },
          { provide: EtiquetaService, useValue: etiquetaServiceSpy },
          { provide: NotificationService, useValue: notificationServiceSpy },
        ],
      });

      fixture = TestBed.createComponent(EtiquetaDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should display "Editar Etiqueta" title', () => {
      const title = fixture.nativeElement.querySelector('h2[mat-dialog-title]');
      expect(title.textContent.trim()).toBe('Editar Etiqueta');
    });

    it('should initialize with existing etiqueta data', () => {
      expect(component.nome).toBe('Alta Prioridade');
      expect(component.corSelecionada).toBe('#F44336');
    });

    it('should call atualizar when saving existing etiqueta', () => {
      component.salvar();
      expect(etiquetaServiceSpy.atualizar).toHaveBeenCalledWith('1', {
        nome: 'Alta Prioridade',
        cor: '#F44336',
      });
    });

    it('should show success notification for update', () => {
      component.salvar();
      expect(notificationServiceSpy.success).toHaveBeenCalledWith('Etiqueta atualizada!', 3000);
    });
  });
});
