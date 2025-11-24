// levante.js COMPLETO - FRACIONADO + DEDICADO (LOTACAO)

// ================== CONSTANTES GERAIS ==================

const AD_VALOREM_FRAC = 0.002;     // 0,20% Valor NF (fracionado)
const TAXA_DESPACHO = 84.74;       // R$ despacho fracionado
const PESO_MIN_KG = 100;           // mínimo fracionado
const ALIQUOTA_ICMS = 0.12;        // 12% (ICMS "por dentro")

const AD_VALOREM_DED = 0.002;      // 0,20% Valor NF (dedicado)
const CAT_DED = 85.60;             // CAT dedicado

// ================== ROTAS FRACIONADO (ROTA I / II) ==================

const ROTA_I = [
  "SAO PAULO",
  "GUARULHOS",
  "ARUJA",
  "MAUA",
  "POA",
  "SANTO ANDRE",
  "SAO CAETANO DO SUL",
  "DIADEMA",
  "SAO BERNARDO DO CAMPO",
  "TABOAO DA SERRA",
  "ITAPECERICA DA SERRA",
  "COTIA",
  "CARAPICUIBA",
  "BARUERI",
  "OSASCO",
  "SANTANA DE PARNAIBA"
];

const ROTA_II = [
  "ATIBAIA",
  "BOM JESUS DOS PERDOES",
  "MAIRIPORA",
  "CAIEIRAS",
  "ITATIBA",
  "BRAGANCA PAULISTA",
  "JARINU",
  "MAIRINQUE",
  "SAO ROQUE",
  "ARACARIGUAMA",
  "SOROCABA",
  "SALTO",
  "BOITUVA",
  "CERQUILHO",
  "ITU",
  "JUNDIAI",
  "CAMPINAS",
  "VALINHOS",
  "VINHEDO",
  "LOUVEIRA",
  "CABREUVA",
  "AMERICANA",
  "SUMARE",
  "ARTHUR NOGUEIRA",
  "PAULINIA",
  "JAGUARIUNA",
  "LIMEIRA",
  "RIO CLARO",
  "PIRACICABA",
  "ITAQUAQUECETUBA",
  "SUZANO",
  "MOGI DAS CRUZES",
  "MOGI GUACU",
  "HOLAMBRA",
  "MONTE MOR",
  "HORTOLANDIA",
  "SANTA BARBARA D OESTE",
  "PORTE FELIZ",
  "CAPIVARI",
  "RIO DAS PEDRAS",
  "CAJAMAR",
  "CORDEIROPOLIS",
  "SANTA GERTRUDES",
  "ARARAS"
];

// valor por tonelada para cada rota (fracionado)
const TARIFA_POR_ROTA = {
  I: 186.18,
  II: 292.11
};

// ================== TABELA DEDICADO (LOTACAO) ==================
// Dados específicos de origem/destino. Se não achar aqui, usamos fallback por rota.

const DEDICADO_ROTAS = [
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "SAO PAULO",
    destinoUF: "SP",
    carreta: 2033.00,
    truck: 909.50,
    toco: 802.50,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 0.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "BARUERI",
    destinoUF: "SP",
    carreta: 2033.00,
    truck: 963.00,
    toco: 856.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 5.80
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "AMERICANA",
    destinoUF: "SP",
    carreta: 0.00,
    truck: 1498.00,
    toco: 1498.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 36.50
  },
  {
    origemCidade: "RIO CLARO",
    origemUF: "SP",
    destinoCidade: "SAO PAULO",
    destinoUF: "SP",
    carreta: 3424.00,
    truck: 2461.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 43.50
  },
  {
    origemCidade: "RIO CLARO",
    origemUF: "SP",
    destinoCidade: "DUQUE DE CAXIAS",
    destinoUF: "RJ",
    carreta: 10165.00,
    truck: 6955.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 105.00
  },
  {
    origemCidade: "RIO CLARO",
    origemUF: "SP",
    destinoCidade: "TRIUNFO",
    destinoUF: "RS",
    carreta: 12626.00,
    truck: 8774.00,
    toco: 7704.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 86.50
  },
  {
    origemCidade: "RIO CLARO",
    origemUF: "SP",
    destinoCidade: "CAMACARI",
    destinoUF: "BA",
    carreta: 17013.00,
    truck: 11663.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 81.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "PAULINIA",
    destinoUF: "SP",
    carreta: 4066.00,
    truck: 2354.00,
    toco: 1284.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 26.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "RIO CLARO",
    destinoUF: "SP",
    carreta: 2889.00,
    truck: 1819.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 45.00
  },
  {
    origemCidade: "CAMACARI",
    origemUF: "BA",
    destinoCidade: "RIO CLARO",
    destinoUF: "SP",
    carreta: 16585.00,
    truck: 9095.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 81.50
  },
  {
    origemCidade: "SOROCABA",
    origemUF: "SP",
    destinoCidade: "RIO CLARO",
    destinoUF: "SP",
    carreta: 2889.00,
    truck: 1819.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 23.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "PINDAMONHANGABA",
    destinoUF: "SP",
    carreta: 4226.50,
    truck: 2086.50,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 30.00
  },
  {
    origemCidade: "ITAJAI",
    origemUF: "SC",
    destinoCidade: "MAUA",
    destinoUF: "SP",
    carreta: 5992.00,
    truck: 0.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 48.20
  },
  {
    origemCidade: "ITAJAI",
    origemUF: "SC",
    destinoCidade: "RIO CLARO",
    destinoUF: "SP",
    carreta: 6848.00,
    truck: 0.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 91.00
  },
  {
    origemCidade: "RIO CLARO",
    origemUF: "SP",
    destinoCidade: "MAUA",
    destinoUF: "SP",
    carreta: 2889.00,
    truck: 1819.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 45.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SC",
    destinoCidade: "TRIUNFO",
    destinoUF: "RS",
    carreta: 0.00,
    truck: 8025.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 67.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "MAUA",
    destinoUF: "SP",
    carreta: 1498.00,
    truck: 749.00,
    toco: 695.50,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 0.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "SANTO ANDRE",
    destinoUF: "SP",
    carreta: 1498.00,
    truck: 749.00,
    toco: 695.50,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 0.00
  },
  {
    origemCidade: "RIO CLARO",
    origemUF: "SP",
    destinoCidade: "PAULINIA",
    destinoUF: "SP",
    carreta: 0.00,
    truck: 1070.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 21.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "SUZANO",
    destinoUF: "SP",
    carreta: 2033.00,
    truck: 909.50,
    toco: 802.50,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 21.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "CAMPINAS",
    destinoUF: "SP",
    carreta: 2889.00,
    truck: 1819.00,
    toco: 1819.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 62.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "SUMARE",
    destinoUF: "SP",
    carreta: 2889.00,
    truck: 1819.00,
    toco: 1498.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 36.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "ITATIBA",
    destinoUF: "SP",
    carreta: 2889.00,
    truck: 1819.00,
    toco: 1819.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 47.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "SAO JOSE DOS CAMPOS",
    destinoUF: "SP",
    carreta: 0.00,
    truck: 1712.00,
    toco: 0.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 30.00
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "GUARUJA",
    destinoUF: "SP",
    carreta: 0.00,
    truck: 1819.00,
    toco: 1712.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 53.50
  },
  {
    origemCidade: "MAUA",
    origemUF: "SP",
    destinoCidade: "VINHEDO",
    destinoUF: "SP",
    carreta: 0.00,
    truck: 1605.00,
    toco: 1498.00,
    f4000: 0,
    f1000: 0,
    pedagioPorEixo: 32.00
  }
];

// Fallback por ROTA quando não houver linha específica (Forma 1)
const DEDICADO_PADRAO_ROTA = {
  I: { carreta: 1900.00, truck: 1400.00, toco: 1200.00, f4000: 900.00, f1000: 850.00 },
  II: { carreta: 2700.00, truck: 1819.00, toco: 1400.00, f4000: 1100.00, f1000: 1000.00 }
};

const DEDICADO_PADRAO_PEDAGIO_POR_EIXO = {
  I: 0.00,
  II: 47.00  // 47 * 3 eixos = 141,00 (caso Jarinu)
};

// definição das faixas de veículo (automático por peso)
const VEICULOS_FAIXAS = [
  { tipo: "carreta", minKg: 12000, eixos: 5 },
  { tipo: "truck",  minKg: 6000,  eixos: 3 },
  { tipo: "toco",   minKg: 3000,  eixos: 2 },
  { tipo: "f4000",  minKg: 1000,  eixos: 2 },
  { tipo: "f1000",  minKg: 0,     eixos: 2 }
];

// ================== FUNÇÕES AUXILIARES ==================

function normalizarTexto(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,']/g, " ")
    .toUpperCase()
    .trim();
}

function formatBRL(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// converte "18.402,42" -> 18402.42
function parseValorBR(valor) {
  if (!valor) return 0;
  valor = valor.replace(/\./g, "");
  valor = valor.replace(",", ".");
  const n = parseFloat(valor);
  return isNaN(n) ? 0 : n;
}

function descobrirRotaFracionado(cidadeDestino) {
  const nome = normalizarTexto(cidadeDestino);
  if (ROTA_I.includes(nome)) return "I";
  if (ROTA_II.includes(nome)) return "II";
  // Forma 1: se não achar, considerar ROTA II por padrão
  return "II";
}

function encontrarRotaDedicado(origemCidade, origemUF, destinoCidade, destinoUF) {
  const oCidade = normalizarTexto(origemCidade);
  const dCidade = normalizarTexto(destinoCidade);
  const oUF = (origemUF || "").toUpperCase();
  const dUF = (destinoUF || "").toUpperCase();

  return DEDICADO_ROTAS.find(r =>
    r.origemCidade === oCidade &&
    r.destinoCidade === dCidade &&
    r.origemUF === oUF &&
    r.destinoUF === dUF
  );
}

function escolherVeiculoPorPeso(pesoKg, rotaObj) {
  // primeiro tenta pela faixa de peso
  for (const v of VEICULOS_FAIXAS) {
    if (pesoKg >= v.minKg) {
      const valorVeiculo = rotaObj[v.tipo];
      if (valorVeiculo && valorVeiculo > 0) {
        return { tipo: v.tipo, valor: valorVeiculo, eixos: v.eixos };
      }
    }
  }
  // fallback: qualquer um que tenha valor > 0
  for (const v of VEICULOS_FAIXAS) {
    const valorVeiculo = rotaObj[v.tipo];
    if (valorVeiculo && valorVeiculo > 0) {
      return { tipo: v.tipo, valor: valorVeiculo, eixos: v.eixos };
    }
  }
  return null;
}

// ================== CÁLCULO FRACIONADO ==================

function calcularFracionado(params, container) {
  const valorNF = parseValorBR(params.get("valor_nf"));
  const pesoKg = parseFloat(params.get("peso") || "0");
  const cidadeDestino = params.get("cidade_destino") || "";
  const ufDestino = (params.get("uf_destino") || "").toUpperCase();

  const rota = descobrirRotaFracionado(cidadeDestino);

  const tarifaTon = TARIFA_POR_ROTA[rota];

  const pesoFaturadoKg = Math.max(pesoKg, PESO_MIN_KG);
  const pesoTon = pesoFaturadoKg / 1000;

  const fretePeso = pesoTon * tarifaTon;
  const freteValor = valorNF * AD_VALOREM_FRAC;
  const despacho = TAXA_DESPACHO;

  const subtotal = fretePeso + freteValor + despacho;

  // ICMS "por dentro"
  const totalComICMS = subtotal / (1 - ALIQUOTA_ICMS);
  const icms = totalComICMS - subtotal;

  container.innerHTML = `
    <h2>Resultado da Simulação - Levante (J&amp;J) - Fracionado</h2>

    <h3>Dados principais</h3>
    <ul>
      <li><strong>Destino:</strong> ${cidadeDestino} - ${ufDestino}</li>
      <li><strong>Rota:</strong> Rota ${rota}</li>
      <li><strong>Valor da NF:</strong> ${formatBRL(valorNF)}</li>
      <li><strong>Peso informado:</strong> ${pesoKg.toFixed(2)} kg</li>
      <li><strong>Peso faturado:</strong> ${pesoFaturadoKg.toFixed(2)} kg (mínimo ${PESO_MIN_KG} kg)</li>
      <li><strong>Tarifa da rota:</strong> ${formatBRL(tarifaTon)} / tonelada</li>
    </ul>

    <h3>Composição do frete (Fracionado)</h3>
    <table class="tabela-frete">
      <thead>
        <tr>
          <th>Item</th>
          <th>Base de cálculo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Frete peso</td>
          <td>${pesoTon.toFixed(3)} t × ${formatBRL(tarifaTon)} / t</td>
          <td>${formatBRL(fretePeso)}</td>
        </tr>
        <tr>
          <td>Frete valor (0,20% da NF)</td>
          <td>0,20% × ${formatBRL(valorNF)}</td>
          <td>${formatBRL(freteValor)}</td>
        </tr>
        <tr>
          <td>Taxa de despacho</td>
          <td>Valor fixo</td>
          <td>${formatBRL(despacho)}</td>
        </tr>
        <tr>
          <td>ICMS (${(ALIQUOTA_ICMS * 100).toFixed(0)}% por dentro)</td>
          <td>Aplicado sobre o valor do serviço</td>
          <td>${formatBRL(icms)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2">Total do serviço (com ICMS)</th>
          <th>${formatBRL(totalComICMS)}</th>
        </tr>
      </tfoot>
    </table>
  `;
}

// ================== CÁLCULO DEDICADO (LOTACAO) ==================

function calcularDedicado(params, container) {
  const valorNF = parseValorBR(params.get("valor_nf"));
  const pesoKg = parseFloat(params.get("peso") || "0");
  const cidadeDestino = params.get("cidade_destino") || "";
  const ufDestino = (params.get("uf_destino") || "").toUpperCase();
  const cidadeOrigem = params.get("cidade_origem") || "";
  const ufOrigem = (params.get("uf_origem") || "").toUpperCase();

  let rotaObj = encontrarRotaDedicado(cidadeOrigem, ufOrigem, cidadeDestino, ufDestino);

  // Se não achou linha específica, aplica Forma 1: rota por cidade (I/II)
  if (!rotaObj) {
    const rotaFr = descobrirRotaFracionado(cidadeDestino); // I ou II (II por padrão)
    const padrao = DEDICADO_PADRAO_ROTA[rotaFr];
    const pedagioPorEixoPadrao = DEDICADO_PADRAO_PEDAGIO_POR_EIXO[rotaFr];

    if (!padrao) {
      container.innerHTML = `
        <h2>Rota dedicada não configurada</h2>
        <p>Não foi possível encontrar tarifa padrão para a rota da cidade <strong>${cidadeDestino}</strong>.</p>
      `;
      return;
    }

    rotaObj = {
      origemCidade: normalizarTexto(cidadeOrigem),
      origemUF: ufOrigem,
      destinoCidade: normalizarTexto(cidadeDestino),
      destinoUF: ufDestino,
      carreta: padrao.carreta,
      truck: padrao.truck,
      toco: padrao.toco,
      f4000: padrao.f4000,
      f1000: padrao.f1000,
      pedagioPorEixo: pedagioPorEixoPadrao
    };
  }

  const veiculo = escolherVeiculoPorPeso(pesoKg, rotaObj);

  if (!veiculo) {
    container.innerHTML = `
      <h2>Sem veículo disponível para este peso</h2>
      <p>Para a rota <strong>${cidadeOrigem} - ${ufOrigem}</strong> →
      <strong>${cidadeDestino} - ${ufDestino}</strong> não há veículo configurado para o peso de
      <strong>${pesoKg.toFixed(2)} kg</strong>.</p>
      <p>Confira a faixa de peso e os valores de Carreta, Truck, Toco, F4000, F1000 na tabela dedicada.</p>
    `;
    return;
  }

  const valorVeiculo = veiculo.valor;
  const pedagioTotal = rotaObj.pedagioPorEixo * veiculo.eixos;
  const freteValor = valorNF * AD_VALOREM_DED;
  const cat = CAT_DED;

  const subtotal = valorVeiculo + pedagioTotal + freteValor + cat;

  // ICMS "por dentro"
  const totalComICMS = subtotal / (1 - ALIQUOTA_ICMS);
  const icms = totalComICMS - subtotal;

  const nomeVeiculoMap = {
    carreta: "Carreta (5 eixos)",
    truck: "Truck (3 eixos)",
    toco: "Toco (2 eixos)",
    f4000: "F4000 (2 eixos)",
    f1000: "F1000 (2 eixos)"
  };

  container.innerHTML = `
    <h2>Resultado da Simulação - Levante (J&amp;J) - Dedicado</h2>

    <h3>Dados principais</h3>
    <ul>
      <li><strong>Origem:</strong> ${cidadeOrigem} - ${ufOrigem}</li>
      <li><strong>Destino:</strong> ${cidadeDestino} - ${ufDestino}</li>
      <li><strong>Peso informado:</strong> ${pesoKg.toFixed(2)} kg</li>
      <li><strong>Veículo selecionado:</strong> ${nomeVeiculoMap[veiculo.tipo] || veiculo.tipo}</li>
      <li><strong>Valor do veículo (tabela):</strong> ${formatBRL(valorVeiculo)}</li>
      <li><strong>Pedágio por eixo:</strong> ${formatBRL(rotaObj.pedagioPorEixo)} (× ${veiculo.eixos} eixos)</li>
      <li><strong>Valor da NF:</strong> ${formatBRL(valorNF)}</li>
    </ul>

    <h3>Composição do frete (Dedicado)</h3>
    <table class="tabela-frete">
      <thead>
        <tr>
          <th>Item</th>
          <th>Base de cálculo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Frete veículo</td>
          <td>${nomeVeiculoMap[veiculo.tipo] || veiculo.tipo}</td>
          <td>${formatBRL(valorVeiculo)}</td>
        </tr>
        <tr>
          <td>Pedágio total</td>
          <td>${formatBRL(rotaObj.pedagioPorEixo)} × ${veiculo.eixos} eixos</td>
          <td>${formatBRL(pedagioTotal)}</td>
        </tr>
        <tr>
          <td>Frete valor (0,20% da NF)</td>
          <td>0,20% × ${formatBRL(valorNF)}</td>
          <td>${formatBRL(freteValor)}</td>
        </tr>
        <tr>
          <td>CAT</td>
          <td>Valor fixo</td>
          <td>${formatBRL(cat)}</td>
        </tr>
        <tr>
          <td>ICMS (${(ALIQUOTA_ICMS * 100).toFixed(0)}% por dentro)</td>
          <td>Aplicado sobre o valor do serviço</td>
          <td>${formatBRL(icms)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2">Total do serviço (com ICMS)</th>
          <th>${formatBRL(totalComICMS)}</th>
        </tr>
      </tfoot>
    </table>
  `;
}

// ================== ENTRADA PRINCIPAL ==================

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const modalidade = params.get("modalidade") || "fracionado";
  const container = document.getElementById("resultado-frete");
  if (!container) return;

  if (modalidade === "lotacao") {
    calcularDedicado(params, container);
  } else {
    calcularFracionado(params, container);
  }
});
