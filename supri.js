// supri.js

// Função para converter valor brasileiro (1.234.567,89) em número JS
function parseValorBR(str) {
  if (!str) return 0;
  if (typeof str !== "string") return Number(str) || 0;
  return Number(
    str
      .replace(/\./g, "")   // remove pontos de milhar
      .replace(",", ".")    // troca vírgula por ponto
  ) || 0;
}

// ----------------------
// Constantes fiscais
// ----------------------
const AD_VALOREM_SUPRI = 0.002;   // 0,20%
const TAXA_CTRC_SUPRI  = 39.01;   // Taxa por CTRC
const FATOR_ICMS_PADRAO = 0.88;   // líquido/bruto (12% ICMS por dentro)
const FATOR_ICMS_BA     = 0.93;   // líquido/bruto (BA)

// ----------------------
// Tabela DEDICADO (Supri-Dedicado)
// Valores extraídos da aba "Supri-Dedicado" da supri-conferencia.xlsx
// ----------------------
const SUPRI_DEDICADO_TABELA = [
  { origem: "MAUÁ",      destino: "SÃO PAULO",       toco: 1308.0,    truck: 1417.0,    carreta: 2976.79,    carretaEstendida: 2976.79 },
  { origem: "RIO CLARO", destino: "SÃO PAULO",       toco: 0.0,       truck: 2377.1265, carreta: 3139.1782,  carretaEstendida: 3139.1782 },
  { origem: "RIO CLARO", destino: "RIO DE JANEIRO",  toco: 0.0,       truck: 3904.3473, carreta: 5510.1026,  carretaEstendida: 5950.9095 },
  { origem: "RIO CLARO", destino: "TRIUNFO",         toco: 0.0,       truck: 5563.2837, carreta: 8808.5407,  carretaEstendida: 8808.5407 },
  { origem: "RIO CLARO", destino: "CAMAÇARI",        toco: 0.0,       truck: 10729.5676,carreta: 17882.6381, carretaEstendida: 17882.6381 },
  { origem: "MAUÁ",      destino: "TRIUNFO",         toco: 0.0,       truck: 5563.2837, carreta: 8808.5407,  carretaEstendida: 8808.5407 },

  { origem: "*MAUÁ",     destino: "ITATIBA",         toco: 1931.5454, truck: 2317.8523, carreta: 2236.68,    carretaEstendida: 0.0 },
  { origem: "*MAUÁ",     destino: "PINDAMONHAMGABA", toco: 0.0,       truck: 2432.8582, carreta: 3902.2,     carretaEstendida: 3902.2 },

  { origem: "** ITAJAI", destino: "MAUÁ",            toco: 0.0,       truck: 4278.3481, carreta: 5709.2347,  carretaEstendida: 0.0 },
  { origem: "** ITAJAI", destino: "RIO CLARO",       toco: 0.0,       truck: 4278.3481, carreta: 5709.2347,  carretaEstendida: 0.0 },

  { origem: "SOROCABA",  destino: "RIO CLARO",       toco: 0.0,       truck: 1377.0406, carreta: 1622.6285,  carretaEstendida: 0.0 },

  { origem: "*MAUÁ",     destino: "DUQUE DE CAXIAS", toco: 0.0,       truck: 3904.3473, carreta: 5510.1026,  carretaEstendida: 5950.9095 },
  { origem: "*MAUÁ",     destino: "DIADEMA",         toco: 0.0,       truck: 1648.3089, carreta: 2237.6719,  carretaEstendida: 2237.6719 },
  { origem: "*MAUÁ",     destino: "CAMAÇARI",        toco: 0.0,       truck: 10729.5676,carreta: 17882.6381, carretaEstendida: 17882.6381 },
  { origem: "*MAUÁ",     destino: "RIO CLARO",       toco: 0.0,       truck: 3139.1782, carreta: 3944.819,   carretaEstendida: 3944.819 },

  { origem: "** ITAJAI", destino: "TRIUNFO",         toco: 0.0,       truck: 4278.3481, carreta: 5709.2347,  carretaEstendida: 0.0 },
  { origem: "*MAUÁ",     destino: "TRIUNFO",         toco: 0.0,       truck: 114.60,    carreta: 2854.6228,  carretaEstendida: 0.0 },

  { origem: "*MAUÁ",     destino: "PAULINIA",        toco: 2168.4024, truck: 2602.0807, carreta: 3938.0828,  carretaEstendida: 3938.1155 },
  { origem: "RIO CLARO", destino: "PAULINIA",        toco: 0.0,       truck: 1886.79,   carreta: 2382.5874,  carretaEstendida: 2851.1784 },
  { origem: "RIO CLARO", destino: "PAULINIA",        toco: 0.0,       truck: 2452.391,  carreta: 3031.2246,  carretaEstendida: 3645.3851 },

  { origem: "*MAUÁ",     destino: "SUZANO",          toco: 1308.0,    truck: 1417.0,    carreta: 0.0,        carretaEstendida: 0.0 },
  { origem: "*MAUÁ",     destino: "SUMARÉ",          toco: 2168.4024, truck: 2602.0807, carreta: 0.0,        carretaEstendida: 0.0 },
  { origem: "*MAUÁ",     destino: "JUNDIAÍ",         toco: 1931.5454, truck: 2317.8523, carreta: 0.0,        carretaEstendida: 0.0 },
  { origem: "*MAUÁ",     destino: "BARUERI",         toco: 1308.0,    truck: 1346.15,   carreta: 0.0,        carretaEstendida: 0.0 },
  { origem: "*MAUÁ",     destino: "MAUÁ",            toco: 1062.75,   truck: 1062.75,   carreta: 0.0,        carretaEstendida: 0.0 }
];

// ----------------------
// Tabela Pedágio (aba "Pedagio"
// opção A = Pedagio NOVO)
// ----------------------
const SUPRI_PEDAGIO_TABELA = [
  // TOCO
  { veiculo: "TOCO", origem: "MAUÁ",      destino: "SÃO PAULO",       pedagioNovo: 113.4,  inclusao: false },
  { veiculo: "TOCO", origem: "MAUÁ",      destino: "JUNDIAI / VINHEDO", pedagioNovo: 113.4, inclusao: false },

  // TRUCK
  { veiculo: "TRUCK", origem: "MAUÁ",      destino: "SÃO PAULO",       pedagioNovo: 113.4,  inclusao: false },
  { veiculo: "TRUCK", origem: "RIO CLARO", destino: "SÃO PAULO",       pedagioNovo: 271.5,  inclusao: false },
  { veiculo: "TRUCK", origem: "RIO CLARO", destino: "DUQUE DE CAXIAS", pedagioNovo: 385.5,  inclusao: false },
  { veiculo: "TRUCK", origem: "RIO CLARO", destino: "TRIUNFO",         pedagioNovo: 385.2,  inclusao: false },
  { veiculo: "TRUCK", origem: "RIO CLARO", destino: "CAMAÇARI",        pedagioNovo: 372.4,  inclusao: false },
  { veiculo: "TRUCK", origem: "RIO CLARO", destino: "PAULINIA",        pedagioNovo: 144.9,  inclusao: false },
  { veiculo: "TRUCK", origem: "RIO CLARO", destino: "SANTO ANDRE",     pedagioNovo: 292.9,  inclusao: false },
  { veiculo: "TRUCK", origem: "SÃO PAULO", destino: "RIO CLARO",       pedagioNovo: 292.8,  inclusao: false },

  // TRUCK com INCLUSÃO (pedágio já incluso no frete)
  { veiculo: "TRUCK", origem: "SC",        destino: "MAUÁ",            pedagioNovo: 121.8,  inclusao: true  },
  { veiculo: "TRUCK", origem: "SC",        destino: "RIO CLARO",       pedagioNovo: 206.1,  inclusao: true  },
  { veiculo: "TRUCK", origem: "SC",        destino: "TRIUNFO",         pedagioNovo: 114.6,  inclusao: true  },
  { veiculo: "TRUCK", origem: "SÃO PAULO", destino: "SUMARE",          pedagioNovo: 148.5,  inclusao: true  },

  // CARRETA ESTENDIDA
  { veiculo: "CARRETA ESTENDIDA", origem: "MAUÁ",      destino: "SÃO PAULO",       pedagioNovo: 170.0,  inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "RIO CLARO", destino: "SÃO PAULO",       pedagioNovo: 462.6,  inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "RIO CLARO", destino: "DUQUE DE CAXIAS", pedagioNovo: 603.5,  inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "RIO CLARO", destino: "TRIUNFO",         pedagioNovo: 503.5,  inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "RIO CLARO", destino: "CAMAÇARI",        pedagioNovo: 551.25, inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "RIO CLARO", destino: "PAULINIA",        pedagioNovo: 259.8,  inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "SÃO PAULO", destino: "RIO CLARO",       pedagioNovo: 462.6,  inclusao: false },
  { veiculo: "CARRETA ESTENDIDA", origem: "CAMAÇARI",  destino: "RIO CLARO",       pedagioNovo: 551.25, inclusao: false }
];

// ----------------------
// Funções utilitárias
// ----------------------
function normalizarTexto(str) {
  if (!str) return "";
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tira acentos
    .replace(/\*/g, "")              // tira asteriscos (*MAUÁ, ** ITAJAI)
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

// Escolha do veículo pelo peso + valores disponíveis
function escolherVeiculo(peso, linha) {
  const p = Number(peso) || 0;

  const veiculos = [];

  if (linha.toco && linha.toco > 0) {
    veiculos.push({ tipo: "TOCO", valor: linha.toco, min: 0,     max: 6000 });
  }
  if (linha.truck && linha.truck > 0) {
    veiculos.push({ tipo: "TRUCK", valor: linha.truck, min: 3000, max: 12000 });
  }
  if (linha.carreta && linha.carreta > 0) {
    veiculos.push({ tipo: "CARRETA", valor: linha.carreta, min: 8000, max: 30000 });
  }
  if (linha.carretaEstendida && linha.carretaEstendida > 0) {
    veiculos.push({ tipo: "CARRETA ESTENDIDA", valor: linha.carretaEstendida, min: 8000, max: 40000 });
  }

  if (veiculos.length == 0) return null;

  // Primeiro tenta respeitar faixas de peso
  let escolhido = veiculos.find(v => p >= v.min && p <= v.max);

  // Se não bater nenhuma faixa, pega o "maior" (último com valor)
  if (!escolhido) {
    escolhido = veiculos[veiculos.length - 1];
  }

  return escolhido;
}

function encontrarLinhaDedicated(origem, destino) {
  const oNorm = normalizarTexto(origem);
  const dNorm = normalizarTexto(destino);

  for (const linha of SUPRI_DEDICADO_TABELA) {
    const oLinha = normalizarTexto(linha.origem);
    const dLinha = normalizarTexto(linha.destino);

    if (oLinha === oNorm && dLinha === dNorm) {
      return linha;
    }
  }

  return null;
}

function encontrarPedagio(veiculo, origem, destino) {
  const oNorm = normalizarTexto(origem);
  const dNorm = normalizarTexto(destino);
  const vNorm = (veiculo || "").toUpperCase();

  for (const p of SUPRI_PEDAGIO_TABELA) {
    if (
      normalizarTexto(p.origem) === oNorm &&
      normalizarTexto(p.destino) === dNorm &&
      p.veiculo.toUpperCase() === vNorm
    ) {
      // Se estiver marcado como inclusão, não soma pedágio em separado
      if (p.inclusao) return 0;
      return Number(p.pedagioNovo) || 0;
    }
  }

  return 0;
}

// ----------------------
// Cálculo principal (DEDICADO)
// ----------------------
function calcularFreteSupriDedicated(params) {
  const valorNF   = parseValorBR(params.valor_nf);   // <<< CORRIGIDO
  const peso      = Number(params.peso || 0);
  const origem    = params.cidade_origem || "";
  const destino   = params.cidade_destino || "";
  const ufDestino = (params.uf_destino || "").toUpperCase();

  const linha = encontrarLinhaDedicated(origem, destino);
  if (!linha) {
    return { erro: "Não encontrei tabela dedicada da Supri para esta origem/destino." };
  }

  const veic = escolherVeiculo(peso, linha);
  if (!veic) {
    return { erro: "Não há veículo configurado para esse peso na tabela dedicada da Supri." };
  }

  const fretePeso  = veic.valor;
  const freteValor = valorNF * AD_VALOREM_SUPRI;
  const taxaCtrc   = TAXA_CTRC_SUPRI;
  const pedagio    = encontrarPedagio(veic.tipo, origem, destino);

  const totalLiquido = fretePeso + freteValor + taxaCtrc + pedagio;

  const fatorICMS = ufDestino === "BA" ? FATOR_ICMS_BA : FATOR_ICMS_PADRAO;
  const totalBruto = totalLiquido / fatorICMS;
  const icmsValor  = totalBruto - totalLiquido;

  return {
    origem,
    destino,
    ufDestino,
    peso,
    valorNF,
    veiculo: veic.tipo,
    fretePeso,
    freteValor,
    taxaCtrc,
    pedagio,
    totalLiquido,
    fatorICMS,
    icmsValor,
    totalBruto
  };
}

// ----------------------
// Leitura da URL + preenchimento da tela
// ----------------------
function lerParamsURL() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};
  for (const [k, v] of params.entries()) {
    obj[k] = v;
  }
  return obj;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = lerParamsURL();

  const blocoErro = document.getElementById("erro-supri");
  const blocoOk   = document.getElementById("bloco-resultado-supri");
  const msgTopo   = document.getElementById("resultado-supri");

  // Por enquanto: Supri apenas DEDICADO
  if (params.modalidade && params.modalidade !== "lotacao") {
    if (blocoOk) blocoOk.style.display = "none";
    if (blocoErro) {
      blocoErro.textContent = "Por enquanto o simulador da Supri está configurado apenas para DEDICADO (lotação).";
    }
    return;
  }

  const resultado = calcularFreteSupriDedicated(params);

  if (resultado.erro) {
    if (blocoOk) blocoOk.style.display = "none";
    if (blocoErro) blocoErro.textContent = resultado.erro;
    return;
  }

  function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  set("supri-origem", `${resultado.origem} / ${resultado.ufDestino || ""}`);
  set("supri-destino", resultado.destino);
  set("supri-veiculo", resultado.veiculo);

  set(
    "supri-peso",
    resultado.peso.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  set(
    "supri-valor-nf",
    resultado.valorNF.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  set(
    "supri-frete-peso",
    resultado.fretePeso.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  set(
    "supri-frete-valor",
    resultado.freteValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  set(
    "supri-taxa-ctrc",
    resultado.taxaCtrc.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  set(
    "supri-pedagio",
    resultado.pedagio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  set(
    "supri-total-liquido",
    resultado.totalLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );

  const aliqTexto = ((1 - resultado.fatorICMS) * 100).toFixed(2).replace(".", ",") + " %";
  set("supri-icms-aliq", aliqTexto);

  set(
    "supri-icms-valor",
    resultado.icmsValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  set(
    "supri-total-bruto",
    resultado.totalBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );

  if (msgTopo) {
    msgTopo.textContent = "Simulação concluída com base na tabela dedicada da Supri.";
  }
});
