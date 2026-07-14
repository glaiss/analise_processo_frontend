import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { adminGuard } from './core/guards/admin.guard';

describe('appRoutes', () => {
  it('should have defined routes', () => {
    expect(routes).toBeDefined();
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should have login route with loginGuard', () => {
    const loginRoute = routes.find(r => r.path === 'login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute!.canActivate).toContain(loginGuard);
  });

  it('should have dashboard route with authGuard', () => {
    const route = routes.find(r => r.path === 'dashboard');
    expect(route).toBeDefined();
    expect(route!.canActivate).toContain(authGuard);
  });

  it('should have default redirect to login', () => {
    const defaultRoute = routes.find(r => r.path === '');
    expect(defaultRoute).toBeDefined();
    expect(defaultRoute!.redirectTo).toBe('login');
    expect(defaultRoute!.pathMatch).toBe('full');
  });

  it('should have auth-protected routes', () => {
    const authPaths = ['dashboard', 'ingestao', 'processos', 'distribuicao',
      'meus-processos', 'processos-equipe', 'meus-dados', 'alterar-senha', 'enriquecimento',
      'processos/monitorados'];
    authPaths.forEach(path => {
      const route = routes.find(r => r.path === path);
      expect(route).toBeDefined();
      expect(route!.canActivate).toBeDefined();
      expect(route!.canActivate).toContain(authGuard);
    });
  });

  it('should have admin-protected routes with authGuard and adminGuard', () => {
    const adminPaths = ['admin', 'admin/monitoramento', 'admin/cache',
      'admin/redirecionar', 'admin/sync', 'usuarios', 'equipes', 'usuarios/equipe'];
    adminPaths.forEach(path => {
      const route = routes.find(r => r.path === path);
      expect(route).toBeDefined();
      expect(route!.canActivate).toBeDefined();
      expect(route!.canActivate).toContain(authGuard);
      expect(route!.canActivate).toContain(adminGuard);
    });
  });

  it('should have processos route with nested monitorados path', () => {
    const monitoradosRoute = routes.find(r => r.path === 'processos/monitorados');
    expect(monitoradosRoute).toBeDefined();
    expect(monitoradosRoute!.data?.['monitorados']).toBe(true);
  });

  it('should have processos/:numero route', () => {
    const route = routes.find(r => r.path === 'processos/:numero');
    expect(route).toBeDefined();
    expect(route!.canActivate).toContain(authGuard);
  });

  it('should have meus-processos and processos-equipe with data', () => {
    const meus = routes.find(r => r.path === 'meus-processos');
    expect(meus).toBeDefined();
    expect(meus!.data?.['mode']).toBe('meus');
    expect(meus!.data?.['title']).toBe('Meus Processos');

    const equipe = routes.find(r => r.path === 'processos-equipe');
    expect(equipe).toBeDefined();
    expect(equipe!.data?.['mode']).toBe('equipe');
    expect(equipe!.data?.['title']).toBe('Processos da Equipe');
  });

  it('should load all route components dynamically', async () => {
    const lazyRoutes = routes.filter(r => typeof r.loadComponent === 'function');
    for (const route of lazyRoutes) {
      const component = await route.loadComponent!();
      expect(component).toBeDefined();
    }
  });
});
