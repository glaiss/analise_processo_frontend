import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let router: any;
  let authService: AuthService;

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: router },
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  it('should allow activation for ADMIN role', () => {
    vi.spyOn(authService, 'hasRole').mockImplementation((role: string) => role === 'ADMIN');

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow activation for GESTOR role', () => {
    vi.spyOn(authService, 'hasRole').mockImplementation((role: string) => role === 'GESTOR');

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard for non-admin roles', () => {
    vi.spyOn(authService, 'hasRole').mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
