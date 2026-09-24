import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

interface Slide { imagem: string; alt: string; legenda: string; }

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="pagina-login-shell">
      <div class="lado esquerdo">
        <div class="marca-logo">
          <img src="assets/img/logo-autoprime.jpeg" alt="AutoPrime - Sistema de Gestão Mecânica">
        </div>

        <h2>Sistema de Gestão Mecânica</h2>
        <p>Controle clientes, veículos e agendamentos da sua oficina em um só lugar, de forma simples e rápida.</p>

        <div class="carrossel-area">
          <div class="carrossel" aria-roledescription="carrossel" aria-label="Serviços da AutoPrime"
               (mouseenter)="parar()" (mouseleave)="iniciar()"
               (touchstart)="touchStart($event)" (touchend)="touchEnd($event)">
            <div class="carrossel-slide" *ngFor="let slide of slides; let i = index" [class.ativo]="i === atual">
              <img [src]="slide.imagem" [alt]="slide.alt">
              <div class="carrossel-legenda">{{ slide.legenda }}</div>
            </div>
            <button type="button" class="carrossel-btn anterior" aria-label="Imagem anterior" (click)="anterior()">‹</button>
            <button type="button" class="carrossel-btn proximo" aria-label="Próxima imagem" (click)="proximo()">›</button>
          </div>
          <div class="carrossel-pontos">
            <button *ngFor="let slide of slides; let i = index" type="button" class="carrossel-ponto"
                    [class.ativo]="i === atual" [attr.aria-label]="'Ir para a imagem ' + (i + 1)"
                    (click)="irPara(i)"></button>
          </div>
        </div>

        <ul class="destaques">
          <li>✅ Agendamento online de serviços</li>
          <li>✅ Painel com visão geral da oficina</li>
          <li>✅ Cadastro de veículos dos clientes</li>
        </ul>
      </div>

      <div class="lado direito">
        <div class="caixa-login">
          <ng-content></ng-content>
        </div>
      </div>
    </main>
  `
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  atual = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private toqueX: number | null = null;

  readonly slides: Slide[] = [
    { imagem: 'assets/img/troca-de-oleo.jpg', alt: 'Troca de óleo', legenda: '🛢️ Troca de óleo' },
    { imagem: 'assets/img/alinhamento-e-balanceamento.jpg', alt: 'Alinhamento e balanceamento', legenda: '🛞 Alinhamento e balanceamento' },
    { imagem: 'assets/img/freios.jpg', alt: 'Sistema de freios', legenda: '🛑 Sistema de freios' },
    { imagem: 'assets/img/reviso.jpg', alt: 'Revisão completa', legenda: '🧰 Revisão completa' },
    { imagem: 'assets/img/diagnstico-eletrnico.jpg', alt: 'Diagnóstico eletrônico', legenda: '💻 Diagnóstico eletrônico' }
  ];

  ngOnInit(): void { this.iniciar(); }

  ngOnDestroy(): void { this.parar(); }

  irPara(indice: number): void {
    this.atual = (indice + this.slides.length) % this.slides.length;
    this.reiniciar();
  }

  anterior(): void { this.irPara(this.atual - 1); }
  proximo(): void { this.irPara(this.atual + 1); }

  iniciar(): void {
    if (this.timer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.timer = setInterval(() => this.atual = (this.atual + 1) % this.slides.length, 4500);
  }

  parar(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  reiniciar(): void { this.parar(); this.iniciar(); }

  touchStart(event: TouchEvent): void {
    this.toqueX = event.touches[0]?.clientX ?? null;
    this.parar();
  }

  touchEnd(event: TouchEvent): void {
    if (this.toqueX !== null) {
      const fim = event.changedTouches[0]?.clientX ?? this.toqueX;
      const diferenca = fim - this.toqueX;
      if (Math.abs(diferenca) > 40) this.atual = (this.atual + (diferenca < 0 ? 1 : -1) + this.slides.length) % this.slides.length;
    }
    this.toqueX = null;
    this.iniciar();
  }
}
