import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ingestao',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ingestion/ingestion.component').then(m => m.IngestionComponent)
  },
  {
    path: 'processos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/processos/processos.component').then(m => m.ProcessosComponent)
  },
  {
    path: 'processos/:numero',
    canActivate: [authGuard],
    loadComponent: () => import('./features/processos/details/process-details.component').then(m => m.ProcessDetailsComponent)
  },
  {
    path: 'distribuicao',
    canActivate: [authGuard],
    loadComponent: () => import('./features/distribuicao/distribuicao.component').then(m => m.DistribuicaoComponent)
  },
  {
    path: 'meus-processos',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/assigned-processes-list/assigned-processes-list.component').then(m => m.AssignedProcessesListComponent),
    data: { mode: 'meus', title: 'Meus Processos' }
  },
  {
    path: 'processos-equipe',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/assigned-processes-list/assigned-processes-list.component').then(m => m.AssignedProcessesListComponent),
    data: { mode: 'equipe', title: 'Processos da Equipe' }
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'enriquecimento',
    canActivate: [authGuard],
    loadComponent: () => import('./features/enriquecimento/reprocessar.component').then(m => m.ReprocessarComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
