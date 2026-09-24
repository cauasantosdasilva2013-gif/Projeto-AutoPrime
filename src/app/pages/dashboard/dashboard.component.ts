import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Agendamento } from '../../core/models';
import { LayoutComponent } from '../../shared/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout titulo="Dashboard" rotulo="Painel Administrativo">
      <div top-actions>
        <div class="icone-btn">🔔</div>
        <a routerLink="/agendamento" class="btn-principal">+ Novo agendamento</a>
      </div>

      <div class="estatisticas">
        <div class="estatistica"><div class="estatistica-icone">👥</div><div><span>CLIENTES</span><h2>{{ totalClientes }}</h2></div></div>
        <div class="estatistica"><div class="estatistica-icone">🚗</div><div><span>VEÍCULOS</span><h2>{{ totalVeiculos }}</h2></div></div>
        <div class="estatistica"><div class="estatistica-icone">🔧</div><div><span>SERVIÇOS OFERECIDOS</span><h2>{{ data.SERVICOS.length }}</h2></div></div>
        <div class="estatistica destaque"><div class="estatistica-icone">📅</div><div><span>AGENDAMENTOS</span><h2>{{ agendamentos.length }}</h2></div></div>
      </div>

      <section class="painel">
        <div class="painel-titulo">
          <div><span>AGENDA</span><h2>Próximos agendamentos</h2></div>
          <a routerLink="/agendamento" class="btn-secundario">+ Novo agendamento</a>
        </div>

        <div *ngIf="!agendamentos.length" class="sem-agendamento">
          <div>📅</div><h3>Nenhum agendamento</h3><p>Os novos agendamentos aparecerão aqui.</p>
        </div>

        <div *ngFor="let ag of agendamentosOrdenados" class="item-agendamento">
          <div class="item-esquerda">
            <div class="item-icone">{{ ag.servicoIcone || '🔧' }}</div>
            <div><h4>{{ ag.veiculoNome }} · {{ ag.placa }}</h4><p>{{ ag.servico }} — {{ ag.unidade }}</p></div>
          </div>
          <div class="item-data"><strong>{{ data.formatarData(ag.data) }}</strong><span>{{ ag.horario }}</span></div>
          <span class="item-status">Confirmado</span>
          <button class="item-remover" title="Cancelar agendamento" type="button" (click)="removerAgendamento(ag.id)">✕</button>
        </div>
      </section>
    </app-layout>
  `
})
export class DashboardComponent {
  agendamentos: Agendamento[] = [];
  totalVeiculos = 0;

  constructor(public readonly data: DataService) { this.atualizar(); }

  get totalClientes(): number { return Math.max(this.totalVeiculos, 1) + 8; }
  get agendamentosOrdenados(): Agendamento[] {
    return [...this.agendamentos].sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
  }

  atualizar(): void {
    this.totalVeiculos = this.data.getVeiculos().length;
    this.agendamentos = this.data.getAgendamentos();
  }

  removerAgendamento(id: number): void {
    this.data.salvarAgendamentos(this.agendamentos.filter(a => a.id !== id));
    this.atualizar();
  }
}
