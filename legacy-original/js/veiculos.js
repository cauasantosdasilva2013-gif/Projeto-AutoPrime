/* =========================================================
   AUTOPRIME - GESTÃO DE VEÍCULOS
   ========================================================= */

let iconeSelecionado = ICONES_VEICULO[0];

document.addEventListener("DOMContentLoaded", () => {

    protegerPagina();

    renderizarTabela();
    renderizarIcones();

    document.getElementById("btnNovoVeiculo").addEventListener("click", abrirModal);
    document.getElementById("btnCancelarModal").addEventListener("click", fecharModal);
    document.getElementById("formVeiculo").addEventListener("submit", salvarVeiculo);
});

function renderizarTabela() {
    const veiculos = obterLista(LS_VEICULOS);
    const corpo = document.getElementById("corpoTabelaVeiculos");
    const vazio = document.getElementById("veiculosVazio");

    if (!veiculos.length) {
        corpo.innerHTML = "";
        vazio.style.display = "block";
        return;
    }

    vazio.style.display = "none";

    corpo.innerHTML = veiculos.map(v => `
        <tr>
            <td>
                <div class="veiculo-nome-icone">
                    <span>${v.icone}</span> ${v.nome}
                </div>
            </td>
            <td><span class="placa-tag">${v.placa}</span></td>
            <td>${v.tipo === "moto" ? "Moto" : "Carro"}</td>
            <td>
                <button class="btn-secundario" data-remover-veiculo="${v.id}">Remover</button>
            </td>
        </tr>
    `).join("");

    corpo.querySelectorAll("[data-remover-veiculo]").forEach(botao => {
        botao.addEventListener("click", () => {
            if (!confirm("Remover este veículo?")) return;
            const id = Number(botao.dataset.removerVeiculo);
            const restantes = obterLista(LS_VEICULOS).filter(v => v.id !== id);
            salvarLista(LS_VEICULOS, restantes);
            renderizarTabela();
        });
    });
}

function renderizarIcones() {
    const container = document.getElementById("icones");
    container.innerHTML = ICONES_VEICULO.map(icone => `
        <div class="icone-opcao ${icone === iconeSelecionado ? "selecionado" : ""}" data-icone="${icone}">${icone}</div>
    `).join("");

    container.querySelectorAll("[data-icone]").forEach(el => {
        el.addEventListener("click", () => {
            iconeSelecionado = el.dataset.icone;
            renderizarIcones();
        });
    });
}

function abrirModal() {
    document.getElementById("formVeiculo").reset();
    iconeSelecionado = ICONES_VEICULO[0];
    renderizarIcones();
    document.getElementById("modalVeiculo").classList.add("ativo");
}

function fecharModal() {
    document.getElementById("modalVeiculo").classList.remove("ativo");
}

function salvarVeiculo(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nomeVeiculo").value.trim();
    const placa = document.getElementById("placaVeiculo").value.trim().toUpperCase();
    const tipo = document.getElementById("tipoVeiculo").value;

    if (!nome || !placa || !tipo) return;

    const veiculos = obterLista(LS_VEICULOS);
    veiculos.push({
        id: gerarId(veiculos),
        nome: nome,
        placa: placa,
        tipo: tipo,
        icone: iconeSelecionado
    });
    salvarLista(LS_VEICULOS, veiculos);

    fecharModal();
    renderizarTabela();
}
