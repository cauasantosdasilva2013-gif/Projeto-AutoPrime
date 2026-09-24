import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgendamentoComponent } from './pages/agendamento/agendamento.component';
import { VeiculosComponent } from './pages/veiculos/veiculos.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'cadastro', component: CadastroComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'agendamento', component: AgendamentoComponent, canActivate: [authGuard] },
  { path: 'veiculos', component: VeiculosComponent, canActivate: [authGuard] },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
