/* =========================================================
   AUTOPRIME - CARROSSEL DA TELA DE LOGIN
   Troca as imagens sozinho, tem setas, bolinhas e swipe no celular.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const carrossel = document.getElementById("carrossel");
    const pontosBox = document.getElementById("carrosselPontos");
    if (!carrossel || !pontosBox) return;

    const slides = Array.from(carrossel.querySelectorAll(".carrossel-slide"));
    const INTERVALO = 4500; // tempo entre imagens (ms)
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let atual = 0;
    let timer = null;

    // cria as bolinhas
    slides.forEach((_, i) => {
        const ponto = document.createElement("button");
        ponto.type = "button";
        ponto.className = "carrossel-ponto";
        ponto.setAttribute("aria-label", "Ir para a imagem " + (i + 1));
        ponto.addEventListener("click", () => { irPara(i); reiniciar(); });
        pontosBox.appendChild(ponto);
    });
    const pontos = Array.from(pontosBox.children);

    function irPara(indice) {
        atual = (indice + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle("ativo", i === atual));
        pontos.forEach((p, i) => p.classList.toggle("ativo", i === atual));
    }

    function iniciar() {
        if (reduzirMovimento || timer) return;
        timer = setInterval(() => irPara(atual + 1), INTERVALO);
    }

    function parar() {
        clearInterval(timer);
        timer = null;
    }

    function reiniciar() {
        parar();
        iniciar();
    }

    carrossel.querySelector(".anterior").addEventListener("click", () => { irPara(atual - 1); reiniciar(); });
    carrossel.querySelector(".proximo").addEventListener("click", () => { irPara(atual + 1); reiniciar(); });

    // pausa com o mouse em cima
    carrossel.addEventListener("mouseenter", parar);
    carrossel.addEventListener("mouseleave", iniciar);

    // swipe no celular
    let inicioX = null;
    carrossel.addEventListener("touchstart", (e) => { inicioX = e.touches[0].clientX; parar(); }, { passive: true });
    carrossel.addEventListener("touchend", (e) => {
        if (inicioX !== null) {
            const dif = e.changedTouches[0].clientX - inicioX;
            if (Math.abs(dif) > 40) irPara(atual + (dif < 0 ? 1 : -1));
        }
        inicioX = null;
        iniciar();
    });

    irPara(0);
    iniciar();
});
