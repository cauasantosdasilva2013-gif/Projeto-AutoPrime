/* =========================================================
   AUTOPRIME - AGENDAMENTO DE SERVIÇO
   ========================================================= */

let veiculoSelecionadoId = null;
let dataSelecionada = null;   // "AAAA-MM-DD"
let horarioSelecionado = null;

let mesAtual;
let anoAtual;

document.addEventListener("DOMContentLoaded", () => {

    protegerPagina();

    const hoje = new Date();
    mesAtual = hoje.getMonth();
    anoAtual = hoje.getFullYear();

    renderizarVeiculos();
    preencherSelects();
    renderizarCalendario();
    renderizarSlots();

    document.getElementById("btnMesAnterior").addEventListener("click", () => mudarMes(-1));
    document.getElementById("btnMesSeguinte").addEventListener("click", () => mudarMes(1));

    document.getElementById("regiao").addEventListener("change", preencherUnidades);

    document.getElementById("formAgendamento").addEventListener("submit", confirmarAgendamento);
    document.getElementById("btnCancelar").addEventListener("click", limparFormulario);
});

/* ---------- VEÍCULOS ---------- */

function renderizarVeiculos() {
    const veiculos = obterLista(LS_VEICULOS);
    const container = document.getElementById("listaVeiculos");

    if (!veiculos.length) {
        container.innerHTML = `<div class="veiculo-vazio">Nenhum veículo cadastrado. <a href="veiculos.html" class="link">Cadastrar veículo →</a></div>`;
        return;
    }

    container.innerHTML = veiculos.map(v => `
        <div class="veiculo-card ${v.id === veiculoSelecionadoId ? "selecionado" : ""}" data-veiculo="${v.id}">
            <div class="veiculo-icone">${v.icone}</div>
            <h4>${v.nome}</h4>
            <span>${v.placa}</span>
        </div>
    `).join("");

    container.querySelectorAll("[data-veiculo]").forEach(card => {
        card.addEventListener("click", () => {
            veiculoSelecionadoId = Number(card.dataset.veiculo);
            renderizarVeiculos();
        });
    });
}

/* ---------- SELECTS (SERVIÇO / REGIÃO / UNIDADE) ---------- */

function preencherSelects() {
    const selectServico = document.getElementById("servico");
    selectServico.innerHTML = `<option value="">Escolha o tipo de serviço</option>` +
        SERVICOS.map(s => `<option value="${s.nome}" data-icone="${s.icone}">${s.nome}</option>`).join("");

    const selectRegiao = document.getElementById("regiao");
    selectRegiao.innerHTML = `<option value="">Escolha a região</option>` +
        REGIOES.map(r => `<option value="${r}">${r}</option>`).join("");
}

function preencherUnidades() {
    const regiao = document.getElementById("regiao").value;
    const selectUnidade = document.getElementById("unidade");

    const unidades = UNIDADES_POR_REGIAO[regiao] || [];
    selectUnidade.innerHTML = `<option value="">Escolha a unidade</option>` +
        unidades.map(u => `<option value="${u}">${u}</option>`).join("");
}

/* ---------- CALENDÁRIO ---------- */

function mudarMes(delta) {
    mesAtual += delta;
    if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
    if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
    renderizarCalendario();
}

function renderizarCalendario() {
    document.getElementById("mesAnoAtual").textContent = `${NOMES_MES[mesAtual]} ${anoAtual}`;

    const container = document.getElementById("calendarioDias");
    container.innerHTML = "";

    const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
    const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 0; i < primeiroDiaSemana; i++) {
        container.innerHTML += `<div class="dia vazio"></div>`;
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const dataAtual = new Date(anoAtual, mesAtual, dia);
        const iso = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        const passou = dataAtual < hoje;
        const ehHoje = dataAtual.getTime() === hoje.getTime();
        const selecionado = iso === dataSelecionada;

        container.innerHTML += `
            <div class="dia ${passou ? "desabilitado" : ""} ${ehHoje ? "hoje" : ""} ${selecionado ? "selecionado" : ""}"
                 data-dia="${passou ? "" : iso}">${dia}</div>`;
    }

    container.querySelectorAll("[data-dia]").forEach(el => {
        if (!el.dataset.dia) return;
        el.addEventListener("click", () => {
            dataSelecionada = el.dataset.dia;
            horarioSelecionado = null;
            renderizarCalendario();
            renderizarSlots();
        });
    });
}

/* ---------- HORÁRIOS ---------- */

function renderizarSlots() {
    const container = document.getElementById("listaSlots");

    if (!dataSelecionada) {
        container.innerHTML = `<div class="veiculo-vazio">Selecione uma data para ver os horários.</div>`;
        return;
    }

    const agendamentos = obterLista(LS_AGENDAMENTOS);
    const ocupados = agendamentos
        .filter(a => a.data === dataSelecionada)
        .map(a => a.horario);

    container.innerHTML = HORARIOS.map(h => {
        const ocupado = ocupados.includes(h);
        const selecionado = h === horarioSelecionado;
        return `<div class="slot ${ocupado ? "ocupado" : ""} ${selecionado ? "selecionado" : ""}" data-slot="${ocupado ? "" : h}">${h}</div>`;
    }).join("");

    container.querySelectorAll("[data-slot]").forEach(el => {
        if (!el.dataset.slot) return;
        el.addEventListener("click", () => {
            horarioSelecionado = el.dataset.slot;
            renderizarSlots();
        });
    });
}

/* ---------- CONFIRMAR / CANCELAR ---------- */

function confirmarAgendamento(evento) {
    evento.preventDefault();

    const mensagem = document.getElementById("mensagem");
    const servicoSelect = document.getElementById("servico");
    const unidade = document.getElementById("unidade").value;
    const observacao = document.getElementById("observacao").value.trim();

    if (!veiculoSelecionadoId) return mostrarMensagem("Selecione um veículo para continuar.", "erro");
    if (!servicoSelect.value) return mostrarMensagem("Selecione o tipo de serviço.", "erro");
    if (!unidade) return mostrarMensagem("Selecione a região e a unidade de atendimento.", "erro");
    if (!dataSelecionada) return mostrarMensagem("Selecione uma data.", "erro");
    if (!horarioSelecionado) return mostrarMensagem("Selecione um horário.", "erro");

    const veiculo = obterLista(LS_VEICULOS).find(v => v.id === veiculoSelecionadoId);
    const servicoIcone = servicoSelect.selectedOptions[0].dataset.icone;

    const agendamentos = obterLista(LS_AGENDAMENTOS);
    agendamentos.push({
        id: gerarId(agendamentos),
        veiculoId: veiculo.id,
        veiculoNome: veiculo.nome,
        placa: veiculo.placa,
        servico: servicoSelect.value,
        servicoIcone: servicoIcone,
        unidade: unidade,
        data: dataSelecionada,
        horario: horarioSelecionado,
        observacao: observacao,
        criadoEm: new Date().toISOString()
    });
    salvarLista(LS_AGENDAMENTOS, agendamentos);

    mostrarMensagem("Agendamento confirmado com sucesso! Redirecionando para o painel...", "sucesso");

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1400);
}

function limparFormulario() {
    veiculoSelecionadoId = null;
    dataSelecionada = null;
    horarioSelecionado = null;
    document.getElementById("formAgendamento").reset();
    renderizarVeiculos();
    renderizarCalendario();
    renderizarSlots();
    document.getElementById("mensagem").className = "";
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = tipo;
}
