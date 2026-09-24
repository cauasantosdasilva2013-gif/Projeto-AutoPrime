import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Agendamento } from '../../core/models';
import { LayoutComponent } from '../../shared/layout.component';

interface GraficoItem { rotulo: string; valor: number; largura: number; pct: number; }

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout titulo="Relatórios" rotulo="Análises">
      <div top-actions><button class="btn-secundario" type="button" (click)="exportarCSV()">⬇️ Exportar CSV</button><button class="btn-principal" type="button" (click)="imprimir()">🖨️ Imprimir</button></div>

      <section class="painel sem-impressao">
        <div class="painel-titulo"><div><span>FILTROS</span><h2>Refine o relatório</h2></div><button class="btn-secundario" type="button" (click)="limparFiltros()">Limpar filtros</button></div>
        <div class="filtros-grid">
          <div class="campo"><label for="filtroPeriodo">Período</label><select id="filtroPeriodo" [(ngModel)]="periodo" (ngModelChange)="gerarRelatorio()"><option value="todos">Todo o período</option><option value="mes">Este mês</option><option value="7">Próximos 7 dias</option><option value="30">Próximos 30 dias</option><option value="passados">Já realizados (antes de hoje)</option></select></div>
          <div class="campo"><label for="filtroServico">Serviço</label><select id="filtroServico" [(ngModel)]="filtroServico" (ngModelChange)="gerarRelatorio()"><option value="">Todos os serviços</option><option *ngFor="let s of servicosFiltro" [value]="s">{{ s }}</option></select></div>
          <div class="campo"><label for="filtroUnidade">Unidade</label><select id="filtroUnidade" [(ngModel)]="filtroUnidade" (ngModelChange)="gerarRelatorio()"><option value="">Todas as unidades</option><option *ngFor="let u of unidadesFiltro" [value]="u">{{ u }}</option></select></div>
          <div class="campo"><label for="filtroVeiculo">Veículo</label><select id="filtroVeiculo" [(ngModel)]="filtroVeiculo" (ngModelChange)="gerarRelatorio()"><option value="">Todos os veículos</option><option *ngFor="let v of data.getVeiculos()" [value]="v.id">{{ v.nome }} · {{ v.placa }}</option></select></div>
        </div>
      </section>

      <section class="painel" *ngIf="!listaFiltrada.length">
        <div class="sem-agendamento"><div>📈</div><h3>Nenhum agendamento encontrado</h3><p>Ajuste os filtros ou crie agendamentos para gerar o relatório.</p><div style="margin-top:18px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;"><a routerLink="/agendamento" class="btn-principal">+ Novo agendamento</a><button class="btn-secundario" type="button" *ngIf="!todosAgendamentos.length" (click)="carregarExemplos()">Carregar dados de exemplo</button></div></div>
      </section>

      <ng-container *ngIf="listaFiltrada.length">
        <div id="relatorioConteudo">
          <div class="estatisticas">
            <div class="estatistica destaque"><div class="estatistica-icone">📅</div><div><span>AGENDAMENTOS</span><h2>{{ listaFiltrada.length }}</h2></div></div>
            <div class="estatistica"><div class="estatistica-icone">🚗</div><div><span>VEÍCULOS ATENDIDOS</span><h2>{{ veiculosAtendidos }}</h2></div></div>
            <div class="estatistica"><div class="estatistica-icone">🔧</div><div><span>SERVIÇO MAIS PROCURADO</span><h2 class="texto">{{ topServico }}</h2></div></div>
            <div class="estatistica"><div class="estatistica-icone">📍</div><div><span>UNIDADE MAIS MOVIMENTADA</span><h2 class="texto">{{ topUnidade }}</h2></div></div>
          </div>

          <div class="duas-colunas">
            <section class="painel"><div class="painel-titulo"><div><span>SERVIÇOS</span><h2>Agendamentos por serviço</h2></div></div><div class="grafico-linhas"><div *ngFor="let item of graficoServicos" class="grafico-linha" [class.zerado]="item.valor === 0"><div class="grafico-rotulo" [title]="item.rotulo">{{ item.rotulo.replace('Oficina AutoPrime - ', '') }}</div><div class="grafico-trilho"><div class="grafico-barra" [style.width.%]="item.largura"></div></div><div class="grafico-valor">{{ item.valor }} <small>({{ item.pct }}%)</small></div></div></div></section>
            <section class="painel"><div class="painel-titulo"><div><span>UNIDADES</span><h2>Agendamentos por unidade</h2></div></div><div class="grafico-linhas"><div *ngFor="let item of graficoUnidades" class="grafico-linha" [class.zerado]="item.valor === 0"><div class="grafico-rotulo" [title]="item.rotulo">{{ item.rotulo.replace('Oficina AutoPrime - ', '') }}</div><div class="grafico-trilho"><div class="grafico-barra" [style.width.%]="item.largura"></div></div><div class="grafico-valor">{{ item.valor }} <small>({{ item.pct }}%)</small></div></div></div></section>
          </div>

          <section class="painel"><div class="painel-titulo"><div><span>HORÁRIOS</span><h2>Horários mais procurados</h2></div></div><div class="grafico-linhas"><div *ngFor="let item of graficoHorarios" class="grafico-linha" [class.zerado]="item.valor === 0"><div class="grafico-rotulo">{{ item.rotulo }}</div><div class="grafico-trilho"><div class="grafico-barra" [style.width.%]="item.largura"></div></div><div class="grafico-valor">{{ item.valor }} <small>({{ item.pct }}%)</small></div></div></div></section>

          <section class="painel"><div class="painel-titulo"><div><span>DETALHAMENTO</span><h2>Lista de agendamentos <small>({{ listaFiltrada.length }})</small></h2></div></div><div class="tabela-scroll"><table class="tabela-veiculos"><thead><tr><th>Data</th><th>Horário</th><th>Veículo</th><th>Placa</th><th>Serviço</th><th>Unidade</th><th>Observação</th></tr></thead><tbody><tr *ngFor="let a of listaFiltrada"><td>{{ data.formatarData(a.data) }}</td><td>{{ a.horario }}</td><td>{{ a.veiculoNome }}</td><td><span class="placa-tag">{{ a.placa }}</span></td><td>{{ a.servico }}</td><td>{{ a.unidade }}</td><td>{{ a.observacao || '—' }}</td></tr></tbody></table></div></section>
          <p class="rodape-relatorio">Relatório gerado em {{ dataHoraAtual }} · AutoPrime — Sistema de Gestão Mecânica</p>
        </div>
      </ng-container>
    </app-layout>
  `
})
export class RelatoriosComponent {
  todosAgendamentos: Agendamento[] = [];
  listaFiltrada: Agendamento[] = [];
  periodo = 'todos'; filtroServico = ''; filtroUnidade = ''; filtroVeiculo = '';
  servicosFiltro: string[] = []; unidadesFiltro: string[] = [];
  graficoServicos: GraficoItem[] = []; graficoUnidades: GraficoItem[] = []; graficoHorarios: GraficoItem[] = [];
  topServico = '—'; topUnidade = '—'; veiculosAtendidos = 0; dataHoraAtual = '';

  constructor(public readonly data: DataService) { this.preencherFiltros(); this.gerarRelatorio(); }

  preencherFiltros(): void {
    this.todosAgendamentos = this.data.getAgendamentos();
    this.servicosFiltro = [...new Set([...this.data.SERVICOS.map(s => s.nome), ...this.todosAgendamentos.map(a => a.servico)])];
    this.unidadesFiltro = [...new Set([...this.data.todasUnidades(), ...this.todosAgendamentos.map(a => a.unidade)])];
  }

  aplicarFiltros(lista: Agendamento[]): Agendamento[] {
    const hoje = this.data.hojeISO();
    return lista.filter(a => {
      if (this.filtroServico && a.servico !== this.filtroServico) return false;
      if (this.filtroUnidade && a.unidade !== this.filtroUnidade) return false;
      if (this.filtroVeiculo && String(a.veiculoId) !== String(this.filtroVeiculo)) return false;
      if (this.periodo === 'mes' && a.data.slice(0, 7) !== hoje.slice(0, 7)) return false;
      if (this.periodo === '7' && (a.data < hoje || a.data > this.data.somarDias(hoje, 7))) return false;
      if (this.periodo === '30' && (a.data < hoje || a.data > this.data.somarDias(hoje, 30))) return false;
      if (this.periodo === 'passados' && a.data >= hoje) return false;
      return true;
    });
  }

  gerarRelatorio(): void {
    this.todosAgendamentos = this.data.getAgendamentos();
    this.listaFiltrada = this.aplicarFiltros(this.todosAgendamentos).sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
    if (!this.listaFiltrada.length) return;
    const porServico = this.contar(this.listaFiltrada, 'servico');
    const porUnidade = this.contar(this.listaFiltrada, 'unidade');
    const topS = this.maisFrequente(porServico); const topU = this.maisFrequente(porUnidade);
    this.topServico = topS ? `${topS[0]} (${topS[1]})` : '—';
    this.topUnidade = topU ? `${topU[0]} (${topU[1]})` : '—';
    this.veiculosAtendidos = new Set(this.listaFiltrada.map(a => a.veiculoId)).size;
    this.graficoServicos = this.criarGrafico([...new Set([...this.data.SERVICOS.map(s => s.nome), ...Object.keys(porServico)])], porServico, true);
    this.graficoUnidades = this.criarGrafico([...new Set([...this.data.todasUnidades(), ...Object.keys(porUnidade)])], porUnidade, true);
    const porHorario = this.contar(this.listaFiltrada, 'horario');
    this.graficoHorarios = this.criarGrafico([...new Set([...this.data.HORARIOS, ...Object.keys(porHorario)])].sort(), porHorario, false);
    this.dataHoraAtual = new Date().toLocaleString('pt-BR');
  }

  contar(lista: Agendamento[], campo: keyof Agendamento): Record<string, number> {
    const mapa: Record<string, number> = {};
    lista.forEach(item => { const chave = String(item[campo]); mapa[chave] = (mapa[chave] || 0) + 1; });
    return mapa;
  }

  maisFrequente(mapa: Record<string, number>): [string, number] | null {
    const entradas = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
    return entradas.length ? entradas[0] : null;
  }

  criarGrafico(rotulos: string[], contagem: Record<string, number>, ordenar: boolean): GraficoItem[] {
    let itens = rotulos.map(rotulo => ({ rotulo, valor: contagem[rotulo] || 0 }));
    if (ordenar) itens.sort((a, b) => b.valor - a.valor);
    const maximo = Math.max(...itens.map(i => i.valor), 1);
    const total = this.listaFiltrada.length;
    return itens.map(i => ({ rotulo: i.rotulo, valor: i.valor, largura: (i.valor / maximo) * 100, pct: total ? Math.round((i.valor / total) * 100) : 0 }));
  }

  limparFiltros(): void { this.periodo = 'todos'; this.filtroServico = ''; this.filtroUnidade = ''; this.filtroVeiculo = ''; this.gerarRelatorio(); }

  imprimir(): void { window.print(); }

  exportarCSV(): void {
    if (!this.listaFiltrada.length) { alert('Não há dados para exportar com os filtros atuais.'); return; }
    const cabecalho = ['Data', 'Horário', 'Veículo', 'Placa', 'Serviço', 'Unidade', 'Observação'];
    const linhas = this.listaFiltrada.map(a => [this.data.formatarData(a.data), a.horario, a.veiculoNome, a.placa, a.servico, a.unidade, a.observacao || '']);
    const celula = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = '\uFEFF' + [cabecalho, ...linhas].map(l => l.map(celula).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `relatorio-autoprime-${this.data.hojeISO()}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  carregarExemplos(): void {
    const veiculos = this.data.getVeiculos();
    if (!veiculos.length) { alert('Cadastre ao menos um veículo antes de carregar os exemplos.'); return; }
    const hoje = this.data.hojeISO(); const deslocamentos = [-12, -9, -6, -4, -2, -1, 0, 1, 2, 3, 5, 6, 9, 13]; const agendamentos = this.data.getAgendamentos();
    deslocamentos.forEach((dias, i) => {
      const veiculo = veiculos[i % veiculos.length]; const servico = this.data.SERVICOS[(i * 5) % this.data.SERVICOS.length]; const unidade = this.data.todasUnidades()[i % this.data.todasUnidades().length];
      agendamentos.push({ id: this.data.gerarId(agendamentos), veiculoId: veiculo.id, veiculoNome: veiculo.nome, placa: veiculo.placa, servico: servico.nome, servicoIcone: servico.icone, unidade, data: this.data.somarDias(hoje, dias), horario: this.data.HORARIOS[(i * 4 + 1) % this.data.HORARIOS.length], observacao: '', criadoEm: new Date().toISOString() });
    });
    this.data.salvarAgendamentos(agendamentos); this.preencherFiltros(); this.gerarRelatorio();
  }
}
