import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <h1>Crie sua conta</h1>
      <p class="subtitulo">Cadastre-se para acessar o painel de gestão da oficina.</p>

      <div *ngIf="erro" class="login-erro" style="display:block">{{ erro }}</div>

      <form class="form-auth" (ngSubmit)="cadastrar()" #form="ngForm">
        <label for="nome">Nome completo</label>
        <input type="text" id="nome" name="nome" [(ngModel)]="nome" placeholder="Digite seu nome" required>

        <label for="e-mail">E-mail</label>
        <input type="email" id="e-mail" name="email" [(ngModel)]="email" placeholder="Digite seu e-mail" required>

        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" [(ngModel)]="senha" placeholder="Mínimo de 4 caracteres" required minlength="4">

        <label for="confirmarSenha">Confirmar senha</label>
        <input type="password" id="confirmarSenha" name="confirmarSenha" [(ngModel)]="confirmarSenha" placeholder="Repita a senha" required>

        <div class="termos-aceite">
          <label class="termos-check" for="termos">
            <input type="checkbox" id="termos" name="termos" [(ngModel)]="aceitouTermos" required>
            <span>Concordo com os termos e a política de privacidade</span>
          </label>
          <a class="termos-link" href="https://www.gov.br/governodigital/pt-br/lgpd-pagina-do-cidadao/o-que-e-a-lgpd" target="_blank" rel="noopener noreferrer">Saiba mais</a>
        </div>

        <button type="submit" [disabled]="!form.valid">Criar conta</button>
      </form>

      <p class="login-cadastro">Já tem uma conta? <a routerLink="/login">Entrar</a></p>
      <p class="login-rodape">© 2026 AutoPrime — Sistema de Gestão Mecânica</p>
    </app-auth-layout>
  `
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  aceitouTermos = false;
  erro = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  cadastrar(): void {
    this.erro = '';

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return;
    }

    const resultado = this.auth.cadastrar(this.nome, this.email.trim().toLowerCase(), this.senha);
    if (!resultado.ok) {
      this.erro = resultado.mensagem ?? 'Não foi possível criar a conta.';
      return;
    }

    void this.router.navigate(['/dashboard']);
  }
}
