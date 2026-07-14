import { TestBed } from '@angular/core/testing';
import { StatusDisplayPipe } from './status-display.pipe';
import { StatusAtribuicao } from '../../core/models/processo/enums.model';

describe('StatusDisplayPipe', () => {
  let pipe: StatusDisplayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StatusDisplayPipe] });
    pipe = TestBed.inject(StatusDisplayPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform NAO_DISPONIVEL to "Não Disponível"', () => {
    expect(pipe.transform(StatusAtribuicao.NAO_DISPONIVEL)).toBe('Não Disponível');
  });

  it('should transform DISPONIVEL to "Disponível"', () => {
    expect(pipe.transform(StatusAtribuicao.DISPONIVEL)).toBe('Disponível');
  });

  it('should transform ATRIBUIDO to "Atribuído"', () => {
    expect(pipe.transform(StatusAtribuicao.ATRIBUIDO)).toBe('Atribuído');
  });

  it('should transform EM_CONVERSA to "Em Conversa"', () => {
    expect(pipe.transform(StatusAtribuicao.EM_CONVERSA)).toBe('Em Conversa');
  });

  it('should transform EM_NEGOCIACAO to "Em Negociação"', () => {
    expect(pipe.transform(StatusAtribuicao.EM_NEGOCIACAO)).toBe('Em Negociação');
  });

  it('should transform CONCLUIDO_SUCESSO to "Concluído com Sucesso"', () => {
    expect(pipe.transform(StatusAtribuicao.CONCLUIDO_SUCESSO)).toBe('Concluído com Sucesso');
  });

  it('should transform CONCLUIDO_RECUSADO to "Concluído Recusado"', () => {
    expect(pipe.transform(StatusAtribuicao.CONCLUIDO_RECUSADO)).toBe('Concluído Recusado');
  });

  it('should return raw value if not found in map', () => {
    expect(pipe.transform('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
