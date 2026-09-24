export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

export interface Sessao {
  id: number;
  nome: string;
  email: string;
}

export interface Veiculo {
  id: number;
  nome: string;
  placa: string;
  tipo: 'carro' | 'moto';
  icone: string;
}

export interface Servico {
  nome: string;
  icone: string;
}

export interface Agendamento {
  id: number;
  veiculoId: number;
  veiculoNome: string;
  placa: string;
  servico: string;
  servicoIcone: string;
  unidade: string;
  data: string;
  horario: string;
  observacao: string;
  criadoEm: string;
}
