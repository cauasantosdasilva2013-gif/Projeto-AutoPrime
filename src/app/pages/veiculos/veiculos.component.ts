import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../shared/layout.component';
import { DataService } from '../../core/data.service';
import { Veiculo } from '../../core/models';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout titulo="Veículos" rotulo="Cadastros">
      <div top-actions><button class="btn-principal" type="button" (click)="abrirModal()">+ Novo veículo</button></div>

      <section class="painel">
        <div class="painel-titulo"><div><span>FROTA DE CLIENTES</span><h2>Veículos cadastrados</h2></div></div>
        <div class="tabela-scroll">
          <table class="tabela-veiculos" *ngIf="veiculos.length">
            <thead><tr><th>Veículo</th><th>Placa</th><th>Tipo</th><th></th></tr></thead>
            <tbody><tr *ngFor="let v of veiculos"><td><div class="veiculo-nome-icone"><span>{{ v.icone }}</span> {{ v.nome }}</div></td><td><span class="placa-tag">{{ v.placa }}</span></td><td>{{ v.tipo === 'moto' ? 'Moto' : 'Carro' }}</td><td><button class="btn-secundario" type="button" (click)="remover(v.id)">Remover</button></td></tr></tbody>
          </table>
        </div>
        <div class="sem-agendamento" *ngIf="!veiculos.length"><div>🚗</div><h3>Nenhum veículo cadastrado</h3><p>Clique em "Novo veículo" para começar.</p></div>
      </section>
    </app-layout>

    <div class="modal-fundo" [class.ativo]="modalAberto" (click)="fecharModal()">
      <div class="modal-caixa" (click)="$event.stopPropagation()">
        <h3>Cadastrar veículo</h3>
        <form (ngSubmit)="salvar()">
          <div class="campo" style="margin-bottom: 16px;"><label>Ícone</label><div class="icone-selecao"><div *ngFor="let icone of data.ICONES_VEICULO" class="icone-opcao" [class.selecionado]="icone === iconeSelecionado" (click)="iconeSelecionado = icone">{{ icone }}</div></div></div>
          <div class="campo" style="margin-bottom: 16px;"><label for="nomeVeiculo">Nome do veículo</label><input id="nomeVeiculo" name="nomeVeiculo" type="text" [(ngModel)]="nome" placeholder="Ex: Honda Civic" required></div>
          <div class="campo" style="margin-bottom: 16px;"><label for="placaVeiculo">Placa</label><input id="placaVeiculo" name="placaVeiculo" type="text" [(ngModel)]="placa" placeholder="ABC-1234" required></div>
          <div class="campo"><label for="tipoVeiculo">Tipo</label><select id="tipoVeiculo" name="tipoVeiculo" [(ngModel)]="tipo" required><option value="carro">Carro</option><option value="moto">Moto</option></select></div>
          <div class="modal-acoes"><button type="button" class="btn-secundario" (click)="fecharModal()">Cancelar</button><button type="submit" class="btn-principal">Salvar veículo</button></div>
        </form>
      </div>
    </div>
  `
})
export class VeiculosComponent {
  veiculos: Veiculo[] = [];
  modalAberto = false;
  iconeSelecionado = '🚗';
  nome = '';
  placa = '';
  tipo: 'carro' | 'moto' = 'carro';

  constructor(public readonly data: DataService) { this.atualizar(); }

  atualizar(): void { this.veiculos = this.data.getVeiculos(); }

  abrirModal(): void {
    this.nome = ''; this.placa = ''; this.tipo = 'carro'; this.iconeSelecionado = this.data.ICONES_VEICULO[0]; this.modalAberto = true;
  }

  fecharModal(): void { this.modalAberto = false; }

  salvar(): void {
    const nome = this.nome.trim();
    const placa = this.placa.trim().toUpperCase();
    if (!nome || !placa) return;
    const lista = this.data.getVeiculos();
    lista.push({ id: this.data.gerarId(lista), nome, placa, tipo: this.tipo, icone: this.iconeSelecionado });
    this.data.salvarVeiculos(lista);
    this.fecharModal(); this.atualizar();
  }

  remover(id: number): void {
    if (!confirm('Remover este veículo?')) return;
    this.data.salvarVeiculos(this.veiculos.filter(v => v.id !== id));
    this.atualizar();
  }
}
