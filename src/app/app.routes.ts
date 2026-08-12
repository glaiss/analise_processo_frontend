import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: async () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ingestao',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/ingestion/ingestion.component').then(m => m.IngestionComponent)
  },
  {
    path: 'processos',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/processos/processos.component').then(m => m.ProcessosComponent)
  },
  {
    path: 'processos/monitorados',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/processos/processos.component').then(m => m.ProcessosComponent),
    data: { monitorados: true }
  },
  {
    path: 'processos/:numero',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/processos/details/process-details.component').then(m => m.ProcessDetailsComponent)
  },
  {
    path: 'distribuicao',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/distribuicao/distribuicao.component').then(m => m.DistribuicaoComponent)
  },
  {
    path: 'meus-processos',
    canActivate: [authGuard],
    loadComponent: async () => import('./shared/components/assigned-processes-list/assigned-processes-list.component').then(m => m.AssignedProcessesListComponent),
    data: { mode: 'meus', title: 'Meus Processos' }
  },
  {
    path: 'processos-equipe',
    canActivate: [authGuard],
    loadComponent: async () => import('./shared/components/assigned-processes-list/assigned-processes-list.component').then(m => m.AssignedProcessesListComponent),
    data: { mode: 'equipe', title: 'Processos da Equipe' }
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'admin/monitoramento',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/monitoring/monitoring.component').then(m => m.MonitoringComponent)
  },
  {
    path: 'admin/cache',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/cache-monitor/cache-monitor.component').then(m => m.CacheMonitorComponent)
  },
  {
    path: 'admin/redirecionar',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/redirecionar-processos/redirecionar-processos.component').then(m => m.RedirecionarProcessosComponent)
  },
  {
    path: 'admin/sync',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/sync/admin-sync.component').then(m => m.AdminSyncComponent)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'equipes',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/team-management/team-management.component').then(m => m.TeamManagementComponent)
  },
  {
    path: 'usuarios/equipe',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/admin/user-team-association/user-team-association.component').then(m => m.UserTeamAssociationComponent)
  },
  {
    path: 'meus-dados',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/meus-dados/meus-dados.component').then(m => m.MeusDadosComponent)
  },
  {
    path: 'alterar-senha',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/alterar-senha/alterar-senha.component').then(m => m.AlterarSenhaComponent)
  },
  {
    path: 'enriquecimento',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/enriquecimento/reprocessar.component').then(m => m.ReprocessarComponent)
  },
  {
    path: 'financeiro',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/financeiro/dashboard/financeiro-dashboard.component').then(m => m.FinanceiroDashboardComponent)
  },
  {
    path: 'financeiro/contratos',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/financeiro/contrato-lista/contrato-lista.component').then(m => m.ContratoListaComponent)
  },
  {
    path: 'financeiro/contratos/novo/:numeroProcesso',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/financeiro/contrato-novo/contrato-novo.component').then(m => m.ContratoNovoComponent)
  },
  {
    path: 'financeiro/contratos/novo',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/financeiro/contrato-novo/contrato-novo.component').then(m => m.ContratoNovoComponent)
  },
  {
    path: 'financeiro/contratos/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/financeiro/contrato-detalhe/contrato-detalhe.component').then(m => m.ContratoDetalheComponent)
  },
  {
    path: 'financeiro/clientes',
    canActivate: [authGuard, adminGuard],
    loadComponent: async () => import('./features/financeiro/clientes/clientes.component').then(m => m.ClientesComponent)
  },
  {
    path: 'relatorios',
    canActivate: [authGuard],
    loadComponent: async () => import('./features/relatorios/relatorios.component').then(m => m.RelatoriosComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
