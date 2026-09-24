import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Agendamento, Veiculo } from '../../core/models';
import { LayoutComponent } from '../../shared/layout.component';

interface DiaCalendario { dia: number; iso: string; vazio?: boolean; passado?: boolean; hoje?: boolean; }

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout titulo="Agendamento de Serviço" rotulo="Oficina AutoPrime">
      <div top-actions><div class="icone-btn">🔔</div></div>

      <form (ngSubmit)="confirmarAgendamento()">
        <section class="bloco" style="margin-bottom: 22px;">
          <div class="bloco-cabecalho"><h3>Selecione o veículo para agendar o serviço</h3><a routerLink="/veiculos">Cadastrar novo veículo</a></div>
          <div class="veiculos-lista">
            <ng-container *ngIf="veiculos.length; else semVeiculos">
              <div *ngFor="let v of veiculos" class="veiculo-card" [class.selecionado]="v.id === veiculoSelecionadoId" (click)="selecionarVeiculo(v.id)">
                <div class="veiculo-icone">{{ v.icone }}</div><h4>{{ v.nome }}</h4><span>{{ v.placa }}</span>
              </div>
            </ng-container>
            <ng-template #semVeiculos><div class="veiculo-vazio">Nenhum veículo cadastrado. <a routerLink="/veiculos" class="link">Cadastrar veículo →</a></div></ng-template>
          </div>
        </section>

        <section class="bloco" style="margin-bottom: 22px;">
          <div class="bloco-cabecalho"><h3>Selecione o serviço e a unidade de atendimento</h3></div>
          <div class="selects-grid">
            <div class="campo"><label for="servico">Tipo de serviço</label><select id="servico" [(ngModel)]="servico" name="servico" required><option value="">Escolha o tipo de serviço</option><option *ngFor="let s of data.SERVICOS" [value]="s.nome">{{ s.nome }}</option></select></div>
            <div class="campo"><label for="regiao">Região</label><select id="regiao" [(ngModel)]="regiao" name="regiao" (ngModelChange)="preencherUnidades()" required><option value="">Escolha a região</option><option *ngFor="let r of data.REGIOES" [value]="r">{{ r }}</option></select></div>
            <div class="campo"><label for="unidade">Unidade de atendimento</label><select id="unidade" [(ngModel)]="unidade" name="unidade" required><option value="">{{ regiao ? 'Escolha a unidade' : 'Escolha a região primeiro' }}</option><option *ngFor="let u of unidades" [value]="u">{{ u }}</option></select></div>
          </div>
        </section>

        <section class="bloco">
          <div class="agenda-grid">
            <div>
              <h3>Selecione a data</h3>
              <div class="calendario-cabecalho"><button type="button" (click)="mudarMes(-1)">‹</button><span>{{ data.NOMES_MES[mesAtual] }} {{ anoAtual }}</span><button type="button" (click)="mudarMes(1)">›</button></div>
              <div class="calendario-semana"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div>
              <div class="calendario-dias">
                <div *ngFor="let dia of diasCalendario" class="dia" [class.vazio]="dia.vazio" [class.desabilitado]="dia.passado" [class.hoje]="dia.hoje" [class.selecionado]="dia.iso === dataSelecionada" (click)="!dia.vazio && !dia.passado && selecionarData(dia.iso)">{{ dia.dia || '' }}</div>
              </div>
            </div>
            <div>
              <h3>Selecione o horário</h3>
              <div class="slots" *ngIf="dataSelecionada; else selecioneData"><div *ngFor="let h of data.HORARIOS" class="slot" [class.ocupado]="horarioOcupado(h)" [class.selecionado]="h === horarioSelecionado" (click)="!horarioOcupado(h) && (horarioSelecionado = h)">{{ h }}</div></div>
              <ng-template #selecioneData><div class="veiculo-vazio">Selecione uma data para ver os horários.</div></ng-template>
            </div>
          </div>

          <div class="campo" style="margin-top: 4px;"><label for="observacao">Observação (opcional)</label><textarea id="observacao" name="observacao" [(ngModel)]="observacao" placeholder="Descreva algum problema ou observação..."></textarea></div>
          <div *ngIf="mensagem" id="mensagem" [class.sucesso]="tipoMensagem === 'sucesso'" [class.erro]="tipoMensagem === 'erro'">{{ mensagem }}</div>
          <div class="acoes-form"><button type="button" class="btn-secundario" (click)="limparFormulario()">Cancelar</button><button type="submit" class="btn-principal">Confirmar agendamento →</button></div>
        </section>
      </form>
    </app-layout>
  `
})
export class AgendamentoComponent {
  veiculos: Veiculo[] = [];
  veiculoSelecionadoId: number | null = null;
  servico = '';
  regiao = '';
  unidade = '';
  unidades: string[] = [];
  dataSelecionada: string | null = null;
  horarioSelecionado: string | null = null;
  observacao = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'erro';
  mesAtual = new Date().getMonth();
  anoAtual = new Date().getFullYear();
  diasCalendario: DiaCalendario[] = [];

  constructor(public readonly data: DataService, private readonly router: Router) {
    this.veiculos = this.data.getVeiculos();
    this.renderizarCalendario();
  }

  selecionarVeiculo(id: number): void { this.veiculoSelecionadoId = id; }

  preencherUnidades(): void {
    this.unidades = this.data.UNIDADES_POR_REGIAO[this.regiao] ?? [];
    this.unidade = '';
  }

  mudarMes(delta: number): void {
    this.mesAtual += delta;
    if (this.mesAtual < 0) { this.mesAtual = 11; this.anoAtual--; }
    if (this.mesAtual > 11) { this.mesAtual = 0; this.anoAtual++; }
    this.renderizarCalendario();
  }

  renderizarCalendario(): void {
    const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1).getDay();
    const totalDias = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    this.diasCalendario = [];
    for (let i = 0; i < primeiroDia; i++) this.diasCalendario.push({ dia: 0, iso: '', vazio: true });
    for (let dia = 1; dia <= totalDias; dia++) {
      const atual = new Date(this.anoAtual, this.mesAtual, dia); atual.setHours(0, 0, 0, 0);
      const iso = `${this.anoAtual}-${String(this.mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      this.diasCalendario.push({ dia, iso, passado: atual < hoje, hoje: atual.getTime() === hoje.getTime() });
    }
  }

  selecionarData(iso: string): void { this.dataSelecionada = iso; this.horarioSelecionado = null; }

  horarioOcupado(horario: string): boolean {
    return this.data.getAgendamentos().some(a => a.data === this.dataSelecionada && a.horario === horario);
  }

  confirmarAgendamento(): void {
    if (!this.veiculoSelecionadoId) return this.mostrarMensagem('Selecione um veículo para continuar.', 'erro');
    if (!this.servico) return this.mostrarMensagem('Selecione o tipo de serviço.', 'erro');
    if (!this.unidade) return this.mostrarMensagem('Selecione a região e a unidade de atendimento.', 'erro');
    if (!this.dataSelecionada) return this.mostrarMensagem('Selecione uma data.', 'erro');
    if (!this.horarioSelecionado) return this.mostrarMensagem('Selecione um horário.', 'erro');

    const veiculo = this.veiculos.find(v => v.id === this.veiculoSelecionadoId);
    const servicoObj = this.data.SERVICOS.find(s => s.nome === this.servico);
    if (!veiculo || !servicoObj) return this.mostrarMensagem('Não foi possível concluir o agendamento.', 'erro');

    const agendamentos = this.data.getAgendamentos();
    agendamentos.push({
      id: this.data.gerarId(agendamentos), veiculoId: veiculo.id, veiculoNome: veiculo.nome, placa: veiculo.placa,
      servico: this.servico, servicoIcone: servicoObj.icone, unidade: this.unidade, data: this.dataSelecionada,
      horario: this.horarioSelecionado, observacao: this.observacao.trim(), criadoEm: new Date().toISOString()
    });
    this.data.salvarAgendamentos(agendamentos);
    this.mostrarMensagem('Agendamento confirmado com sucesso! Redirecionando para o painel...', 'sucesso');
    setTimeout(() => void this.router.navigate(['/dashboard']), 1400);
  }

  mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro'): void { this.mensagem = texto; this.tipoMensagem = tipo; }

  limparFormulario(): void {
    this.veiculoSelecionadoId = null; this.servico = ''; this.regiao = ''; this.unidade = ''; this.unidades = [];
    this.dataSelecionada = null; this.horarioSelecionado = null; this.observacao = ''; this.mensagem = '';
    this.mesAtual = new Date().getMonth(); this.anoAtual = new Date().getFullYear(); this.renderizarCalendario();
  }
}
