import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Sessao, Usuario } from './models';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly data: DataService, private readonly router: Router) {}

  get sessao(): Sessao | null {
    try {
      const raw = localStorage.getItem(this.data.LS_SESSAO);
      return raw ? JSON.parse(raw) as Sessao : null;
    } catch {
      return null;
    }
  }

  estaLogado(): boolean { return !!this.sessao; }

  login(email: string, senha: string): { ok: boolean; mensagem?: string } {
    if (!email || !senha) return { ok: false, mensagem: 'Informe e-mail e senha.' };

    const usuarios = this.data.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return { ok: false, mensagem: 'Não encontramos uma conta com este e-mail. Crie uma conta para continuar.' };
    }
    if (usuario.senha !== senha) {
      return { ok: false, mensagem: 'E-mail ou senha incorretos.' };
    }

    this.criarSessao(usuario);
    return { ok: true };
  }

  cadastrar(nome: string, email: string, senha: string): { ok: boolean; mensagem?: string } {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return { ok: false, mensagem: 'Informe seu nome.' };
    if (!REGEX_EMAIL.test(email)) return { ok: false, mensagem: 'Informe um e-mail válido.' };
    if (senha.length < 4) return { ok: false, mensagem: 'A senha deve ter pelo menos 4 caracteres.' };

    const usuarios = this.data.getUsuarios();
    if (usuarios.some(u => u.email === email)) {
      return { ok: false, mensagem: 'Já existe uma conta com este e-mail. Faça login.' };
    }

    const usuario: Usuario = { id: this.data.gerarId(usuarios), nome: nomeLimpo, email, senha };
    usuarios.push(usuario);
    this.data.salvarUsuarios(usuarios);

    this.criarSessao(usuario);
    return { ok: true };
  }

  logout(): void {
    localStorage.removeItem(this.data.LS_SESSAO);
    void this.router.navigate(['/login']);
  }

  private criarSessao(usuario: Usuario): void {
    const sessao: Sessao = { id: usuario.id, nome: usuario.nome, email: usuario.email };
    localStorage.setItem(this.data.LS_SESSAO, JSON.stringify(sessao));
  }
}
