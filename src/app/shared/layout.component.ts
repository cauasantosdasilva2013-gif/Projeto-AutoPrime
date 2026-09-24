import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="sidebar" [class.menu-aberto]="menuAberto">
        <div class="sidebar-topo">
          <a class="logo" routerLink="/dashboard" (click)="fecharMenu()">
            <img src="assets/img/logo-autoprime.jpeg" alt="AutoPrime">
          </a>
          <button class="menu-mobile-btn" type="button" aria-label="Abrir menu" (click)="menuAberto = !menuAberto">☰</button>
        </div>

        <nav>
          <a routerLink="/dashboard" routerLinkActive="ativo" [routerLinkActiveOptions]="{exact:true}" (click)="fecharMenu()"><span class="icone">📊</span> Dashboard</a>
          <a routerLink="/agendamento" routerLinkActive="ativo" (click)="fecharMenu()"><span class="icone">📅</span> Agendamentos</a>
          <a routerLink="/veiculos" routerLinkActive="ativo" (click)="fecharMenu()"><span class="icone">🚗</span> Veículos</a>
          <a routerLink="/relatorios" routerLinkActive="ativo" (click)="fecharMenu()"><span class="icone">📈</span> Relatórios</a>
          <a href="javascript:void(0)"><span class="icone">⚙️</span> Configurações</a>
          <a href="javascript:void(0)" (click)="sair()"><span class="icone">↩️</span> Sair</a>
        </nav>

        <div class="promo">
          <div class="promo-emoji">🛠️</div>
          <h4>Hora da revisão?</h4>
          <p>Agende agora e mantenha o veículo do cliente seguro na estrada.</p>
          <a routerLink="/agendamento" (click)="fecharMenu()">Agendar agora</a>
        </div>
      </aside>

      <main class="conteudo">
        <div class="topbar">
          <div>
            <span class="rotulo">{{ rotulo }}</span>
            <h1>{{ titulo }}</h1>
          </div>
          <div class="topbar-acoes">
            <ng-content select="[top-actions]"></ng-content>
            <div class="usuario-chip">
              <div class="usuario-avatar">{{ inicialUsuario }}</div>
              <div>
                <div class="usuario-nome">{{ nomeUsuario }}</div>
                <div class="usuario-sair" (click)="sair()">Sair</div>
              </div>
            </div>
          </div>
        </div>
        <ng-content></ng-content>
      </main>
    </div>
  `
})
export class LayoutComponent {
  @Input() titulo = '';
  @Input() rotulo = '';
  menuAberto = false;

  constructor(public readonly auth: AuthService) {}

  get nomeUsuario(): string { return this.auth.sessao?.nome ?? 'Usuário'; }
  get inicialUsuario(): string { return this.nomeUsuario.trim().charAt(0).toUpperCase() || 'U'; }

  fecharMenu(): void { this.menuAberto = false; }
  sair(): void { this.auth.logout(); }
}
