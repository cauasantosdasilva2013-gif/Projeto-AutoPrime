import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/data.service';
import { Agendamento, StatusVeiculo } from '../../core/models';
import { LayoutComponent } from '../../shared/layout.component';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout titulo="Status do Veículo" rotulo="Acompanhamento">
      <section class="painel" *ngIf="agendamentosOrdenados.length; else vazio">
        <div class="painel-titulo">
          <div><span>ACOMPANHAMENTO</span><h2>Andamento dos serviços</h2></div>
        </div>

        <div class="status-card" *ngFor="let ag of agendamentosOrdenados">
          <div class="status-card-cabecalho">
            <div class="status-card-veiculo">
              <span class="status-card-icone">{{ ag.servicoIcone || '🔧' }}</span>
              <div>
                <h4>{{ ag.veiculoNome }} · {{ ag.placa }}</h4>
                <p>{{ ag.servico }} — {{ ag.unidade }}</p>
              </div>
            </div>
            <span class="status-badge" [class]="'status-' + statusAtual(ag)">{{ rotuloStatus(ag) }}</span>
          </div>

          <div class="linha-tempo">
            <div class="etapa" *ngFor="let etapa of data.ETAPAS_STATUS; let i = index"
                 [class.concluida]="i <= indiceStatus(ag)"
                 [class.atual]="i === indiceStatus(ag)">
              <div class="etapa-linha-esquerda" *ngIf="i > 0"></div>
              <div class="etapa-ponto">{{ etapa.icone }}</div>
              <div class="etapa-linha-direita" *ngIf="i < data.ETAPAS_STATUS.length - 1"></div>
              <span class="etapa-rotulo">{{ etapa.rotulo }}</span>
            </div>
          </div>

          <div class="status-acoes" *ngIf="indiceStatus(ag) < data.ETAPAS_STATUS.length - 1; else concluidoMsg">
            <button type="button" class="btn-secundario" (click)="avancarStatus(ag)">
              Avançar para "{{ proximaEtapaRotulo(ag) }}" →
            </button>
          </div>
          <ng-template #concluidoMsg>
            <div class="status-concluido-msg">✅ Veículo entregue ao cliente.</div>
          </ng-template>
        </div>
      </section>

      <ng-template #vazio>
        <section class="painel">
          <div class="sem-agendamento">
            <div>🧭</div>
            <h3>Nenhum serviço em andamento</h3>
            <p>O status dos veículos aparecerá aqui assim que houver agendamentos.</p>
          </div>
        </section>
      </ng-template>
    </app-layout>
  `
})
export class StatusComponent {
  agendamentos: Agendamento[] = [];

  constructor(public readonly data: DataService) { this.atualizar(); }

  get agendamentosOrdenados(): Agendamento[] {
    return [...this.agendamentos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }

  atualizar(): void { this.agendamentos = this.data.getAgendamentos(); }

  statusAtual(ag: Agendamento): StatusVeiculo { return ag.status ?? 'recebido'; }

  indiceStatus(ag: Agendamento): number { return this.data.indiceEtapa(this.statusAtual(ag)); }

  rotuloStatus(ag: Agendamento): string {
    return this.data.ETAPAS_STATUS[this.indiceStatus(ag)]?.rotulo ?? '';
  }

  proximaEtapaRotulo(ag: Agendamento): string {
    return this.data.ETAPAS_STATUS[this.indiceStatus(ag) + 1]?.rotulo ?? '';
  }

  avancarStatus(ag: Agendamento): void {
    const proxima = this.data.ETAPAS_STATUS[this.indiceStatus(ag) + 1];
    if (!proxima) return;
    this.data.atualizarStatusAgendamento(ag.id, proxima.chave);
    this.atualizar();
  }
}
