/* =========================================================
   AUTOPRIME - RELATÓRIOS
   Lê os agendamentos do localStorage, aplica filtros e mostra
   resumo, gráficos em barras e tabela. Exporta CSV e imprime.
   ========================================================= */

let listaFiltrada = [];

document.addEventListener("DOMContentLoaded", () => {

    protegerPagina();

    preencherFiltros();

    ["filtroPeriodo", "filtroServico", "filtroUnidade", "filtroVeiculo"].forEach(id => {
        document.getElementById(id).addEventListener("change", gerarRelatorio);
    });

    document.getElementById("btnLimpar").addEventListener("click", () => {
        document.getElementById("filtroPeriodo").value = "todos";
        document.getElementById("filtroServico").value = "";
        document.getElementById("filtroUnidade").value = "";
        document.getElementById("filtroVeiculo").value = "";
        gerarRelatorio();
    });

    document.getElementById("btnExportar").addEventListener("click", exportarCSV);
    document.getElementById("btnImprimir").addEventListener("click", () => window.print());
    document.getElementById("btnExemplos").addEventListener("click", carregarExemplos);

    gerarRelatorio();
});

/* ---------- utilidades ---------- */

function esc(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function dois(n) {
    return String(n).padStart(2, "0");
}

function dataParaISO(d) {
    return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

function hojeISO() {
    return dataParaISO(new Date());
}

function somarDias(iso, dias) {
    const [a, m, d] = iso.split("-").map(Number);
    return dataParaISO(new Date(a, m - 1, d + dias));
}

function todasUnidades() {
    return Object.values(UNIDADES_POR_REGIAO).flat();
}

/* ---------- filtros ---------- */

function preencherFiltros() {
    const agendamentos = obterLista(LS_AGENDAMENTOS);

    const servicos = new Set(SERVICOS.map(s => s.nome));
    agendamentos.forEach(a => servicos.add(a.servico));

    const unidades = new Set(todasUnidades());
    agendamentos.forEach(a => unidades.add(a.unidade));

    document.getElementById("filtroServico").innerHTML =
        `<option value="">Todos os serviços</option>` +
        [...servicos].map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");

    document.getElementById("filtroUnidade").innerHTML =
        `<option value="">Todas as unidades</option>` +
        [...unidades].map(u => `<option value="${esc(u)}">${esc(u)}</option>`).join("");

    const veiculos = obterLista(LS_VEICULOS);
    document.getElementById("filtroVeiculo").innerHTML =
        `<option value="">Todos os veículos</option>` +
        veiculos.map(v => `<option value="${v.id}">${esc(v.nome)} · ${esc(v.placa)}</option>`).join("");
}

function aplicarFiltros(agendamentos) {
    const periodo = document.getElementById("filtroPeriodo").value;
    const servico = document.getElementById("filtroServico").value;
    const unidade = document.getElementById("filtroUnidade").value;
    const veiculo = document.getElementById("filtroVeiculo").value;
    const hoje = hojeISO();

    return agendamentos.filter(a => {
        if (servico && a.servico !== servico) return false;
        if (unidade && a.unidade !== unidade) return false;
        if (veiculo && String(a.veiculoId) !== veiculo) return false;

        if (periodo === "mes" && a.data.slice(0, 7) !== hoje.slice(0, 7)) return false;
        if (periodo === "7" && (a.data < hoje || a.data > somarDias(hoje, 7))) return false;
        if (periodo === "30" && (a.data < hoje || a.data > somarDias(hoje, 30))) return false;
        if (periodo === "passados" && a.data >= hoje) return false;

        return true;
    });
}

/* ---------- geração do relatório ---------- */

function contar(lista, campo) {
    const mapa = {};
    lista.forEach(item => { mapa[item[campo]] = (mapa[item[campo]] || 0) + 1; });
    return mapa;
}

function maisFrequente(mapa) {
    const entradas = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
    return entradas.length ? entradas[0] : null;
}

function gerarRelatorio() {
    const todos = obterLista(LS_AGENDAMENTOS);
    const lista = aplicarFiltros(todos);
    listaFiltrada = [...lista].sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

    const vazio = document.getElementById("relatorioVazio");
    const conteudo = document.getElementById("relatorioConteudo");

    if (!lista.length) {
        vazio.style.display = "block";
        conteudo.style.display = "none";
        // "dados de exemplo" só faz sentido quando não há nenhum agendamento salvo
        document.getElementById("btnExemplos").style.display = todos.length ? "none" : "inline-flex";
        return;
    }

    vazio.style.display = "none";
    conteudo.style.display = "block";

    // resumo
    const porServico = contar(lista, "servico");
    const porUnidade = contar(lista, "unidade");
    const topServico = maisFrequente(porServico);
    const topUnidade = maisFrequente(porUnidade);

    document.getElementById("kpiTotal").textContent = lista.length;
    document.getElementById("kpiVeiculos").textContent = new Set(lista.map(a => a.veiculoId)).size;
    document.getElementById("kpiServico").textContent = topServico ? `${topServico[0]} (${topServico[1]})` : "—";
    document.getElementById("kpiUnidade").textContent = topUnidade ? `${topUnidade[0]} (${topUnidade[1]})` : "—";

    // gráficos
    const baseServicos = SERVICOS.map(s => s.nome);
    Object.keys(porServico).forEach(s => { if (!baseServicos.includes(s)) baseServicos.push(s); });
    desenharBarras("graficoServicos", baseServicos, porServico, lista.length, true);

    const baseUnidades = todasUnidades();
    Object.keys(porUnidade).forEach(u => { if (!baseUnidades.includes(u)) baseUnidades.push(u); });
    desenharBarras("graficoUnidades", baseUnidades, porUnidade, lista.length, true);

    const porHorario = contar(lista, "horario");
    const baseHorarios = [...HORARIOS];
    Object.keys(porHorario).forEach(h => { if (!baseHorarios.includes(h)) baseHorarios.push(h); });
    baseHorarios.sort();
    desenharBarras("graficoHorarios", baseHorarios, porHorario, lista.length, false);

    // tabela
    document.getElementById("corpoTabelaRelatorio").innerHTML = listaFiltrada.map(a => `
        <tr>
            <td>${formatarData(a.data)}</td>
            <td>${esc(a.horario)}</td>
            <td>${esc(a.veiculoNome)}</td>
            <td><span class="placa-tag">${esc(a.placa)}</span></td>
            <td>${esc(a.servico)}</td>
            <td>${esc(a.unidade)}</td>
            <td>${esc(a.observacao) || "—"}</td>
        </tr>
    `).join("");

    document.getElementById("contagemTabela").textContent = `(${lista.length})`;
    document.getElementById("rodapeRelatorio").textContent =
        `Relatório gerado em ${new Date().toLocaleString("pt-BR")} · AutoPrime — Sistema de Gestão Mecânica`;
}

function desenharBarras(idContainer, rotulos, contagem, total, ordenarPorValor) {
    let itens = rotulos.map(r => ({ rotulo: r, valor: contagem[r] || 0 }));
    if (ordenarPorValor) itens.sort((a, b) => b.valor - a.valor);

    const maximo = Math.max(...itens.map(i => i.valor), 1);

    document.getElementById(idContainer).innerHTML = itens.map(i => {
        const largura = (i.valor / maximo) * 100;
        const pct = total ? Math.round((i.valor / total) * 100) : 0;
        return `
            <div class="grafico-linha ${i.valor === 0 ? "zerado" : ""}">
                <div class="grafico-rotulo" title="${esc(i.rotulo)}">${esc(i.rotulo.replace("Oficina AutoPrime - ", ""))}</div>
                <div class="grafico-trilho"><div class="grafico-barra" style="width:${largura}%"></div></div>
                <div class="grafico-valor">${i.valor} <small>(${pct}%)</small></div>
            </div>`;
    }).join("");
}

/* ---------- exportar CSV ---------- */

function exportarCSV() {
    if (!listaFiltrada.length) {
        alert("Não há dados para exportar com os filtros atuais.");
        return;
    }

    const cabecalho = ["Data", "Horário", "Veículo", "Placa", "Serviço", "Unidade", "Observação"];
    const linhas = listaFiltrada.map(a => [
        formatarData(a.data), a.horario, a.veiculoNome, a.placa, a.servico, a.unidade, a.observacao || ""
    ]);

    const celula = v => `"${String(v).replace(/"/g, '""')}"`;
    // ponto e vírgula + BOM: o Excel em português abre certinho
    const csv = "\uFEFF" + [cabecalho, ...linhas].map(l => l.map(celula).join(";")).join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-autoprime-${hojeISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

/* ---------- dados de exemplo (opcional, só para demonstração) ---------- */

function carregarExemplos() {
    const veiculos = obterLista(LS_VEICULOS);
    if (!veiculos.length) {
        alert("Cadastre ao menos um veículo antes de carregar os exemplos.");
        return;
    }

    const hoje = hojeISO();
    const deslocamentos = [-12, -9, -6, -4, -2, -1, 0, 1, 2, 3, 5, 6, 9, 13];
    const agendamentos = obterLista(LS_AGENDAMENTOS);

    deslocamentos.forEach((dias, i) => {
        const veiculo = veiculos[i % veiculos.length];
        const servico = SERVICOS[(i * 5) % SERVICOS.length];
        const unidade = todasUnidades()[i % todasUnidades().length];
        agendamentos.push({
            id: gerarId(agendamentos),
            veiculoId: veiculo.id,
            veiculoNome: veiculo.nome,
            placa: veiculo.placa,
            servico: servico.nome,
            servicoIcone: servico.icone,
            unidade: unidade,
            data: somarDias(hoje, dias),
            horario: HORARIOS[(i * 4 + 1) % HORARIOS.length],
            observacao: "",
            criadoEm: new Date().toISOString()
        });
    });

    salvarLista(LS_AGENDAMENTOS, agendamentos);
    preencherFiltros();
    gerarRelatorio();
}
