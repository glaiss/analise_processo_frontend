import { TestBed } from '@angular/core/testing';
import { ScoreDisplayPipe } from './score-display.pipe';

describe('ScoreDisplayPipe', () => {
  let pipe: ScoreDisplayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ScoreDisplayPipe] });
    pipe = TestBed.inject(ScoreDisplayPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform ALTO to "Alto"', () => {
    expect(pipe.transform('ALTO')).toBe('Alto');
  });

  it('should transform INTERMEDIARIO_ALTO to "Intermediário Alto"', () => {
    expect(pipe.transform('INTERMEDIARIO_ALTO')).toBe('Intermediário Alto');
  });

  it('should transform MEDIO to "Médio"', () => {
    expect(pipe.transform('MEDIO')).toBe('Médio');
  });

  it('should transform INTERMEDIARIO_BAIXO to "Intermediário Baixo"', () => {
    expect(pipe.transform('INTERMEDIARIO_BAIXO')).toBe('Intermediário Baixo');
  });

  it('should transform MINIMO to "Mínimo"', () => {
    expect(pipe.transform('MINIMO')).toBe('Mínimo');
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
