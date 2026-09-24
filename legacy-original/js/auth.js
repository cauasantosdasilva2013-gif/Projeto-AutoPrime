/* =========================================================
   AUTOPRIME - AUTENTICAÇÃO
   ========================================================= */

/* Caminho relativo até a raiz do projeto, definido em cada página
   (o index.html define "./", as páginas em /html/ definem "../") */
const RAIZ = typeof CAMINHO_RAIZ !== "undefined" ? CAMINHO_RAIZ : "../";

function obterSessao() {
    try {
        return JSON.parse(localStorage.getItem(LS_SESSAO));
    } catch (e) {
        return null;
    }
}

/* Chame no topo de toda página interna (dashboard, agendamento, veículos...) */
function protegerPagina() {
    const sessao = obterSessao();
    if (!sessao) {
        window.location.href = RAIZ + "index.html";
        return null;
    }
    preencherUsuario(sessao);
    return sessao;
}

function preencherUsuario(sessao) {
    const nomeEl = document.querySelector("[data-usuario-nome]");
    const avatarEl = document.querySelector("[data-usuario-avatar]");
    if (nomeEl) nomeEl.textContent = sessao.nome;
    if (avatarEl) avatarEl.textContent = sessao.nome.trim().charAt(0).toUpperCase();
}

function sair() {
    localStorage.removeItem(LS_SESSAO);
    window.location.href = RAIZ + "index.html";
}

document.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-sair]")) {
        sair();
    }
});
