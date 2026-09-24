import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <h1>Bem-vindo de volta</h1>
      <p class="subtitulo">Entre com sua conta para acessar o painel da oficina.</p>

      <div *ngIf="erro" class="login-erro" style="display:block">{{ erro }}</div>

      <form class="form-auth" (ngSubmit)="entrar()" #form="ngForm">
        <label for="e-mail">E-mail</label>
        <input type="email" id="e-mail" name="email" [(ngModel)]="email" placeholder="Digite seu e-mail" required>

        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" [(ngModel)]="senha" placeholder="Digite sua senha" required>

        <button type="submit" [disabled]="!form.valid">Entrar</button>
      </form>

      <div class="login-dica">
        💡 Demonstração: use <strong>admin&#64;autoprime.com</strong> / <strong>123456</strong>. Se preferir, crie sua própria conta.
      </div>
      <p class="login-cadastro">Ainda não tem conta? <a routerLink="/cadastro">Criar conta</a></p>

      <div class="login-contato">
        <span>📞 <a href="tel:+557193459872">(71) 9345-9872</a></span>
        <span>✉️ <a href="mailto:autoprime@gmail.com">autoprime@gmail.com</a></span>
      </div>

      <p class="login-rodape">© 2026 AutoPrime — Sistema de Gestão Mecânica</p>
    </app-auth-layout>
  `
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  entrar(): void {
    this.erro = '';
    const resultado = this.auth.login(this.email.trim().toLowerCase(), this.senha);
    if (!resultado.ok) {
      this.erro = resultado.mensagem ?? 'Não foi possível entrar.';
      return;
    }
    void this.router.navigate(['/dashboard']);
  }
}
