/* =========================================================
   AUTOPRIME - DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    protegerPagina();

    const veiculos = obterLista(LS_VEICULOS);
    const agendamentos = obterLista(LS_AGENDAMENTOS);

    document.getElementById("totalVeiculos").textContent = veiculos.length;
    document.getElementById("totalAgendamentos").textContent = agendamentos.length;
    document.getElementById("totalServicos").textContent = SERVICOS.length;
    document.getElementById("totalClientes").textContent = Math.max(veiculos.length, 1) + 8;

    renderizarAgendamentos(agendamentos);
});

function renderizarAgendamentos(agendamentos) {

    const lista = document.getElementById("listaAgendamentos");

    if (!agendamentos.length) {
        lista.innerHTML = `
            <div class="sem-agendamento">
                <div>📅</div>
                <h3>Nenhum agendamento</h3>
                <p>Os novos agendamentos aparecerão aqui.</p>
            </div>`;
        return;
    }

    const ordenados = [...agendamentos].sort((a, b) =>
        (a.data + a.horario).localeCompare(b.data + b.horario)
    );

    lista.innerHTML = ordenados.map(ag => `
        <div class="item-agendamento">
            <div class="item-esquerda">
                <div class="item-icone">${ag.servicoIcone || "🔧"}</div>
                <div>
                    <h4>${ag.veiculoNome} · ${ag.placa}</h4>
                    <p>${ag.servico} — ${ag.unidade}</p>
                </div>
            </div>
            <div class="item-data">
                <strong>${formatarData(ag.data)}</strong>
                <span>${ag.horario}</span>
            </div>
            <span class="item-status">Confirmado</span>
            <button class="item-remover" title="Cancelar agendamento" data-remover-agendamento="${ag.id}">✕</button>
        </div>
    `).join("");
}

document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-remover-agendamento]");
    if (!botao) return;

    const id = Number(botao.dataset.removerAgendamento);
    const agendamentos = obterLista(LS_AGENDAMENTOS).filter(a => a.id !== id);
    salvarLista(LS_AGENDAMENTOS, agendamentos);

    document.getElementById("totalAgendamentos").textContent = agendamentos.length;
    renderizarAgendamentos(agendamentos);
});
