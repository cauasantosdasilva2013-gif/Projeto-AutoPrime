import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
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
          <a href="javascript:void(0)" (click)="abrirConfiguracoes(); $event.preventDefault()"><span class="icone">⚙️</span> Configurações</a>
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
              <ng-container *ngIf="!fotoPerfilPreview; else avatarPerfil">
                <div class="usuario-avatar">{{ inicialUsuario }}</div>
              </ng-container>
              <ng-template #avatarPerfil>
                <img class="usuario-avatar usuario-avatar-imagem" [src]="fotoPerfilPreview" alt="Foto de perfil" />
              </ng-template>
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

    <div class="config-modal-fundo" *ngIf="configAberta" (click)="fecharConfiguracoes()">
      <aside class="config-modal" (click)="$event.stopPropagation()">
        <div class="config-header">
          <h3>Configurações</h3>
          <button type="button" class="config-fechar" aria-label="Fechar configurações" (click)="fecharConfiguracoes()">×</button>
        </div>

        <div class="config-grupo">
          <label class="config-label">
            <span>Endereço</span>
            <input type="text" [(ngModel)]="configuracoes.endereco" placeholder="Rua, número, bairro" />
          </label>
        </div>

        <div class="config-grupo">
          <label class="config-label">
            <span>CPF</span>
            <input type="text" [(ngModel)]="configuracoes.cpf" placeholder="000.000.000-00" />
          </label>
        </div>

        <div class="config-grupo">
          <label class="config-label">
            <span>Opção de pagamento</span>
            <select [(ngModel)]="configuracoes.pagamento">
              <option value="PIX">PIX</option>
              <option value="Cartão de crédito">Cartão de crédito</option>
              <option value="Cartão de débito">Cartão de débito</option>
              <option value="Boleto">Boleto</option>
              <option value="Transferência bancária">Transferência bancária</option>
            </select>
          </label>
        </div>

        <div class="config-grupo">
          <label class="config-label upload-label">
            <span>Trocar foto de perfil</span>
            <input type="file" accept="image/*" (change)="trocarFotoPerfil($event)" />
          </label>

          <div class="foto-preview" *ngIf="fotoPerfilPreview">
            <img [src]="fotoPerfilPreview" alt="Pré-visualização do perfil" />
          </div>
        </div>

        <div class="config-grupo">
          <div class="tema-row">
            <span>Tema escuro</span>
            <button type="button" class="tema-toggle" [class.ativo]="temaEscuro" (click)="alterarTema()" aria-label="Alternar tema escuro">
              <span class="tema-bolinha"></span>
            </button>
          </div>
        </div>

        <div class="config-acoes">
          <button type="button" class="btn-secundario" (click)="fecharConfiguracoes()">Cancelar</button>
          <button type="button" class="btn-principal" (click)="salvarConfiguracoes()">Salvar</button>
        </div>
      </aside>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  @Input() titulo = '';
  @Input() rotulo = '';
  menuAberto = false;
  configAberta = false;
  temaEscuro = false;
  fotoPerfilPreview = '';
  configuracoes = {
    endereco: '',
    cpf: '',
    pagamento: 'PIX',
    fotoPerfil: ''
  };

  constructor(public readonly auth: AuthService) {}

  ngOnInit(): void {
    this.carregarConfiguracoes();
    this.aplicarTema();
  }

  get nomeUsuario(): string { return this.auth.sessao?.nome ?? 'Usuário'; }
  get inicialUsuario(): string { return this.nomeUsuario.trim().charAt(0).toUpperCase() || 'U'; }

  abrirConfiguracoes(): void { this.configAberta = true; }
  fecharConfiguracoes(): void { this.configAberta = false; }
  fecharMenu(): void { this.menuAberto = false; }
  sair(): void { this.auth.logout(); }

  alterarTema(): void {
    this.temaEscuro = !this.temaEscuro;
    localStorage.setItem('autoprime-tema', this.temaEscuro ? 'escuro' : 'claro');
    this.aplicarTema();
  }

  aplicarTema(): void {
    document.body.classList.toggle('modo-escuro', this.temaEscuro);
  }

  trocarFotoPerfil(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) {
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = String(leitor.result ?? '');
      this.fotoPerfilPreview = resultado;
      this.configuracoes.fotoPerfil = resultado;
    };

    leitor.readAsDataURL(arquivo);
  }

  salvarConfiguracoes(): void {
    localStorage.setItem('autoprime-config', JSON.stringify(this.configuracoes));
    if (this.fotoPerfilPreview) {
      localStorage.setItem('autoprime-foto', this.fotoPerfilPreview);
    }
    this.fecharConfiguracoes();
  }

  carregarConfiguracoes(): void {
    const configArmazenada = localStorage.getItem('autoprime-config');
    const fotoArmazenada = localStorage.getItem('autoprime-foto');
    const temaArmazenado = localStorage.getItem('autoprime-tema');

    if (configArmazenada) {
      this.configuracoes = { ...this.configuracoes, ...JSON.parse(configArmazenada) };
    }

    if (fotoArmazenada) {
      this.fotoPerfilPreview = fotoArmazenada;
      this.configuracoes.fotoPerfil = fotoArmazenada;
    }

    if (temaArmazenado === 'escuro') {
      this.temaEscuro = true;
    }
  }
}
