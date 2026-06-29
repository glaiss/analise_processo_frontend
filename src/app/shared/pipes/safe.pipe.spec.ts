import { SafePipe } from './safe.pipe';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafePipe', () => {
  let pipe: SafePipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafePipe],
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = TestBed.inject(SafePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should bypass security for resource URL', () => {
    const spy = vi.spyOn(sanitizer, 'bypassSecurityTrustResourceUrl');
    const url = 'https://example.com/document.pdf';
    pipe.transform(url);
    expect(spy).toHaveBeenCalledWith(url);
  });

  it('should return empty string for null url', () => {
    const result = pipe.transform(null);
    expect(result).toBe('');
  });

  it('should return empty string for undefined url', () => {
    const result = pipe.transform(undefined as unknown as null);
    expect(result).toBe('');
  });
});
