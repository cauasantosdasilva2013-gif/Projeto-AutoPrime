/* =========================================================
   AUTOPRIME - DADOS E CONSTANTES COMPARTILHADAS
   Tudo é salvo no localStorage do navegador (sem servidor).
   ========================================================= */

const LS_USUARIOS = "autoprime_usuarios";
const LS_SESSAO = "autoprime_sessao";
const LS_VEICULOS = "autoprime_veiculos";
const LS_AGENDAMENTOS = "autoprime_agendamentos";

const SERVICOS = [
    { nome: "Troca de óleo", icone: "🛢️" },
    { nome: "Alinhamento e balanceamento", icone: "🛞" },
    { nome: "Sistema de freios", icone: "🛑" },
    { nome: "Revisão completa", icone: "🧰" },
    { nome: "Diagnóstico eletrônico", icone: "💻" },
    { nome: "Troca de bateria", icone: "🔋" }
];

const REGIOES = ["Zona Norte", "Zona Sul", "Centro", "Zona Leste"];

const UNIDADES_POR_REGIAO = {
    "Zona Norte": ["Oficina AutoPrime - Unidade Norte"],
    "Zona Sul": ["Oficina AutoPrime - Unidade Sul"],
    "Centro": ["Oficina AutoPrime - Unidade Centro"],
    "Zona Leste": ["Oficina AutoPrime - Unidade Leste"]
};

const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const ICONES_VEICULO = ["🚗", "🚙", "🏎️", "🚚", "🏍️"];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const NOMES_MES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function obterLista(chave) {
    try {
        const dado = localStorage.getItem(chave);
        return dado ? JSON.parse(dado) : [];
    } catch (e) {
        return [];
    }
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function gerarId(lista) {
    return lista.length ? Math.max(...lista.map(i => i.id)) + 1 : 1;
}

/* Preenche o sistema com dados de demonstração na primeira visita */
function iniciarDadosPadrao() {

    if (!localStorage.getItem(LS_USUARIOS)) {
        salvarLista(LS_USUARIOS, [
            { id: 1, nome: "Administrador", email: "admin@autoprime.com", senha: "123456" }
        ]);
    }

    if (!localStorage.getItem(LS_VEICULOS)) {
        salvarLista(LS_VEICULOS, [
            { id: 1, nome: "Honda Civic",     placa: "ABC-1234", tipo: "carro", icone: "🚗" },
            { id: 2, nome: "Fiat Toro",       placa: "GHI-4567", tipo: "carro", icone: "🚚" },
            { id: 3, nome: "BMW M3",          placa: "JKL-3050", tipo: "carro", icone: "🏎️" },
            { id: 4, nome: "Yamaha YZF-R3",   placa: "LMN-8291", tipo: "moto",  icone: "🏍️" }
        ]);
    }

    if (!localStorage.getItem(LS_AGENDAMENTOS)) {
        salvarLista(LS_AGENDAMENTOS, []);
    }
}

iniciarDadosPadrao();

/* Formata "2026-09-25" para "25 Set 2026" */
function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-").map(Number);
    const abrev = NOMES_MES[mes - 1].slice(0, 3);
    return `${String(dia).padStart(2, "0")} ${abrev} ${ano}`;
}
