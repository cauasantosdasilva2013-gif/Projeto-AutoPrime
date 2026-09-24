import { Injectable } from '@angular/core';
import { Agendamento, EtapaStatus, Servico, StatusVeiculo, Usuario, Veiculo } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly LS_USUARIOS = 'autoprime_usuarios';
  readonly LS_SESSAO = 'autoprime_sessao';
  readonly LS_VEICULOS = 'autoprime_veiculos';
  readonly LS_AGENDAMENTOS = 'autoprime_agendamentos';

  readonly SERVICOS: Servico[] = [
    { nome: 'Troca de óleo', icone: '🛢️' },
    { nome: 'Alinhamento e balanceamento', icone: '🛞' },
    { nome: 'Sistema de freios', icone: '🛑' },
    { nome: 'Revisão completa', icone: '🧰' },
    { nome: 'Diagnóstico eletrônico', icone: '💻' },
    { nome: 'Troca de bateria', icone: '🔋' }
  ];

  readonly REGIOES = ['Zona Norte', 'Zona Nordeste', 'Zona Sul', 'Centro', 'Zona Leste'];
  readonly UNIDADES_POR_REGIAO: Record<string, string[]> = {
    'Zona Norte': ['Oficina AutoPrime - Unidade Norte'],
    'Zona Nordeste': ['Oficina AutoPrime - Unidade Nordeste'],
    'Zona Sul': ['Oficina AutoPrime - Unidade Sul'],
    'Centro': ['Oficina AutoPrime - Unidade Centro'],
    'Zona Leste': ['Oficina AutoPrime - Unidade Leste']
  };
  readonly HORARIOS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  readonly ICONES_VEICULO = ['🚗', '🚙', '🏎️', '🚚', '🏍️'];
  readonly ETAPAS_STATUS: EtapaStatus[] = [
    { chave: 'recebido', rotulo: 'Recebido', icone: '📥', descricao: 'Veículo recebido na oficina' },
    { chave: 'diagnostico', rotulo: 'Em diagnóstico', icone: '🔍', descricao: 'Avaliação do problema em andamento' },
    { chave: 'manutencao', rotulo: 'Em manutenção', icone: '🔧', descricao: 'Serviço sendo executado' },
    { chave: 'pronto', rotulo: 'Pronto para retirada', icone: '✅', descricao: 'Serviço concluído, aguardando retirada' },
    { chave: 'entregue', rotulo: 'Entregue', icone: '🚗', descricao: 'Veículo entregue ao cliente' }
  ];
  readonly NOMES_MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  constructor() {
    this.iniciarDadosPadrao();
  }

  obterLista<T>(chave: string): T[] {
    try {
      const dado = localStorage.getItem(chave);
      return dado ? JSON.parse(dado) as T[] : [];
    } catch {
      return [];
    }
  }

  salvarLista<T>(chave: string, lista: T[]): void {
    localStorage.setItem(chave, JSON.stringify(lista));
  }

  gerarId<T extends { id: number }>(lista: T[]): number {
    return lista.length ? Math.max(...lista.map(i => i.id)) + 1 : 1;
  }

  getUsuarios(): Usuario[] { return this.obterLista<Usuario>(this.LS_USUARIOS); }
  getVeiculos(): Veiculo[] { return this.obterLista<Veiculo>(this.LS_VEICULOS); }
  getAgendamentos(): Agendamento[] { return this.obterLista<Agendamento>(this.LS_AGENDAMENTOS); }

  salvarVeiculos(lista: Veiculo[]): void { this.salvarLista(this.LS_VEICULOS, lista); }
  salvarAgendamentos(lista: Agendamento[]): void { this.salvarLista(this.LS_AGENDAMENTOS, lista); }
  salvarUsuarios(lista: Usuario[]): void { this.salvarLista(this.LS_USUARIOS, lista); }

  indiceEtapa(status: StatusVeiculo | undefined): number {
    const indice = this.ETAPAS_STATUS.findIndex(e => e.chave === (status ?? 'recebido'));
    return indice === -1 ? 0 : indice;
  }

  atualizarStatusAgendamento(id: number, status: StatusVeiculo): void {
    const lista = this.getAgendamentos().map(a => a.id === id ? { ...a, status } : a);
    this.salvarAgendamentos(lista);
  }

  todasUnidades(): string[] { return Object.values(this.UNIDADES_POR_REGIAO).flat(); }

  formatarData(dataISO: string): string {
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const abrev = this.NOMES_MES[mes - 1].slice(0, 3);
    return `${String(dia).padStart(2, '0')} ${abrev} ${ano}`;
  }

  dataParaISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  hojeISO(): string { return this.dataParaISO(new Date()); }

  somarDias(iso: string, dias: number): string {
    const [a, m, d] = iso.split('-').map(Number);
    return this.dataParaISO(new Date(a, m - 1, d + dias));
  }

  private iniciarDadosPadrao(): void {
    if (!localStorage.getItem(this.LS_USUARIOS)) {
      this.salvarUsuarios([{ id: 1, nome: 'Administrador', email: 'admin@autoprime.com', senha: '123456' }]);
    }
    if (!localStorage.getItem(this.LS_VEICULOS)) {
      this.salvarVeiculos([
        { id: 1, nome: 'Honda Civic', placa: 'ABC-1234', tipo: 'carro', icone: '🚗' },
        { id: 2, nome: 'Fiat Toro', placa: 'GHI-4567', tipo: 'carro', icone: '🚚' },
        { id: 3, nome: 'BMW M3', placa: 'JKL-3050', tipo: 'carro', icone: '🏎️' },
        { id: 4, nome: 'Yamaha YZF-R3', placa: 'LMN-8291', tipo: 'moto', icone: '🏍️' }
      ]);
    }
    if (!localStorage.getItem(this.LS_AGENDAMENTOS)) {
      this.salvarAgendamentos([]);
    }
  }
}
