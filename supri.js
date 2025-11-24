// supri.js - cálculo dedicado Supri (mesma lógica da planilha)

const SUPRI_AD_VALOREM = 0.002;          // 0,20% (líquido sobre NF)
const SUPRI_TAXA_CTRC_LIQ = 39.01;       // taxa por CTRC (líquida)

// ICMS
const SUPRI_ICMS_PADRAO = 0.12;          // maioria dos casos
const SUPRI_ICMS_BA = 0.07;              // quando destino BA (planilha: fator 0,93)

// mapeamento rápido de rotas principais (origem MAUÁ)
const SUPRI_ROTAS = [
  {
    rotaId: "I_II",
    origem: "MAUA",
    destinos: ["JUNDIAI", "SUMARE", "ITUPEVA", "LOUVEIRA"]
  },
  {
    rotaId: "III",
    origem: "MAUA",
    destinos: ["VINHEDO", "ITATIBA"]
  },
  {
    rotaId: "IV_V",
    origem: "MAUA",
    destinos: ["RIO CLARO", "AMERICANA", "PIRACICABA"]
  }
];

// tabela dedicada (valores LÍQUIDOS = antes do ICMS)
// complete com os mesmos valores da aba "Supri_Dedicado"
const SUPRI_DEDICADO_TABELA = {
  "I_II": {
    // EXEMPLO: preencha com os seus valores
    // truck: { fretePeso: 0, pedagio: 0 },
  },
  "III": {
    // idem
  },
  "IV_V": {
    // Exemplo real calibrado pelo CT-e 40061 (peso 7.280kg, NF 264.984,03)
    // Frete Peso líquido: 3.139,18  | Pedágio líquido: 345,00
    truck: { fretePeso: 3139.18, pedagio: 345.00 }
  }
};

// mesmas faixas de veículo usadas na Levante
const SUPRI_VEICULOS_FAIXAS = [
  { tipo: "carreta", minKg: 12000, eixos: 5 },
  { tipo: "truck",   minKg: 6000,  eixos: 3 },
  { tipo: "toco",    minKg: 3000,  eixos: 2 },
  { tipo: "f4000",   minKg: 1000,  eixos: 2 },
  { tipo: "f1000",   minKg: 0,     eixos: 2 }
];

function normalizarTexto(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,']/g, " ")
    .toUpperCase()
    .trim();
}

// "18.402,42" -> 18402.42
function parseValorBR(str) {
  if (!str) return 0;
  str = str.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function obterAliquotaICMS(ufDestino) {
  if (ufDestino === "BA") return SUPRI_ICMS_BA;
  return SUPRI_ICMS_PADRAO;
}

function descobrirRotaSupri(origemCidade, destinoCidade) {
  const origem = normalizarTexto(origemCidade);
  const destino = normalizarTexto(destinoCidade);

  // procura mapeamento da planilha
  for (const rota of SUPRI_ROTAS) {
    if (origem === rota.origem && rota.destinos.includes(destino)) {
      return rota.rotaId;
    }
  }

  // fallback: assume rotas IV & V
  return "IV_V";
}

function escolherVeiculoPorPesoSupri(pesoKg, tabelaRota) {
  for (const cfg of SUPRI_VEICULOS_FAIXAS) {
    if (pesoKg >= cfg.minKg) {
      const linha = tabelaRota && tabelaRota[cfg.tipo];
      if (linha && linha.fretePeso > 0) {
        return { tipo: cfg.tipo, eixos: cfg.eixos, ...linha };
      }
    }
  }
  // se não achar por peso, pega qualquer veículo com valor configurado
  for (const cfg of SUPRI_VEICULOS_FAIXAS) {
    const linha = tabelaRota && tabelaRota[cfg.tipo];
    if (linha && linha.fretePeso > 0) {
      return { tipo: cfg.tipo, eixos: cfg.eixos, ...linha };
    }
  }
  return null;
}

function calcularSupriDedicado(params, container) {
  const valorNF = parseValorBR(params.get("valor_nf"));
  const pesoKg = parseFloat(params.get("peso") || "0");
  const cidadeOrigem = params.get("cidade_origem") || "";
  const cidadeDestino = params.get("cidade_destino") || "";
  const ufDestino = (params.get("uf_destino") || "").toUpperCase();

  const rotaId = descobrirRotaSupri(cidadeOrigem, cidadeDestino);
  const tabelaRota = SUPRI_DEDICADO_TABELA[rotaId];

  if (!tabelaRota) {
    container.innerHTML = `
      <h2>Rota Supri não configurada</h2>
      <p>Configure os valores da rota <strong>${rotaId}</strong> em <code>SUPRI_DEDICADO_TABELA</code>
      com base na aba <strong>Supri_Dedicado</strong> da planilha.</p>
    `;
    return;
  }

  const veiculo = escolherVeiculoPorPesoSupri(pesoKg, tabelaRota);
  if (!veiculo) {
    container.innerHTML = `
      <h2>Veículo não configurado</h2>
      <p>Para a rota <strong>${rotaId}</strong> não há frete peso cadastrado
      para o peso de <strong>${pesoKg.toFixed(2)} kg</strong>.<br>
      Atualize o objeto <code>SUPRI_DEDICADO_TABELA</code> com os valores da tabela da Supri.</p>
    `;
    return;
  }

  const aliquota = obterAliquotaICMS(ufDestino);
  const fator = 1 - aliquota;
  const fatorBruto = 1 / fator;

  // valores LÍQUIDOS (iguais à coluna da sua planilha)
  const fretePesoLiq = veiculo.fretePeso;
  const pedagioLiq = veiculo.pedagio;
  const freteValorLiq = valorNF * SUPRI_AD_VALOREM;
  const taxaLiq = SUPRI_TAXA_CTRC_LIQ;

  const subtotalLiq = fretePesoLiq + freteValorLiq + taxaLiq + pedagioLiq;

  // valores BRUTOS (como aparecem no CT-e)
  const fretePeso = fretePesoLiq * fatorBruto;
  const freteValor = freteValorLiq * fatorBruto;
  const taxa = taxaLiq * fatorBruto;
  const pedagio = pedagioLiq * fatorBruto;

  const subtotalBruto = subtotalLiq * fatorBruto;
  const icms = subtotalBruto - subtotalLiq;

  const nomeVeiculo = {
    carreta: "Carreta",
    truck: "Truck",
    toco: "Toco",
    f4000: "F4000",
    f1000: "F1000"
  }[veiculo.tipo] || veiculo.tipo;

  container.innerHTML = `
    <h2>Resultado da Simulação - Supri (Dedicado)</h2>

    <h3>Dados principais</h3>
    <ul>
      <li><strong>Origem:</strong> ${cidadeOrigem}</li>
      <li><strong>Destino:</strong> ${cidadeDestino} - ${ufDestino}</li>
      <li><strong>Rota Supri:</strong> ${rotaId}</li>
      <li><strong>Peso:</strong> ${pesoKg.toFixed(2)} kg</li>
      <li><strong>Veículo:</strong> ${nomeVeiculo}</li>
      <li><strong>Valor NF:</strong> ${formatBRL(valorNF)}</li>
      <li><strong>Alíquota ICMS:</strong> ${(aliquota * 100).toFixed(0)}%</li>
    </ul>

    <h3>Composição do frete (valores como no CT-e)</h3>
    <table class="tabela-frete">
      <thead>
        <tr>
          <th>Item</th>
          <th>Base</th>
          <th>Líquido</th>
          <th>Valor CT-e</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Frete peso</td>
          <td>Tabela rota ${rotaId} (${nomeVeiculo})</td>
          <td>${formatBRL(fretePesoLiq)}</td>
          <td>${formatBRL(fretePeso)}</td>
        </tr>
        <tr>
          <td>Frete valor (0,20% NF)</td>
          <td>0,20% × ${formatBRL(valorNF)}</td>
          <td>${formatBRL(freteValorLiq)}</td>
          <td>${formatBRL(freteValor)}</td>
        </tr>
        <tr>
          <td>Taxa por CTRC</td>
          <td>Valor fixo</td>
          <td>${formatBRL(taxaLiq)}</td>
          <td>${formatBRL(taxa)}</td>
        </tr>
        <tr>
          <td>Pedágio</td>
          <td>Conforme tabela/pista</td>
          <td>${formatBRL(pedagioLiq)}</td>
          <td>${formatBRL(pedagio)}</td>
        </tr>
        <tr>
          <td>ICMS (${(aliquota * 100).toFixed(0)}% por dentro)</td>
          <td>Sobre o valor do serviço</td>
          <td>${formatBRL(icms)}</td>
          <td>${formatBRL(icms)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2">Total do serviço (CT-e)</th>
          <th>${formatBRL(subtotalLiq)}</th>
          <th>${formatBRL(subtotalBruto)}</th>
        </tr>
      </tfoot>
    </table>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const modalidade = params.get('modalidade') || 'lotacao';
  const container = document.getElementById('resultado-frete');
  if (!container) return;

  if (modalidade !== 'lotacao') {
    container.innerHTML = `
      <h2>Modalidade não configurada</h2>
      <p>Por enquanto o cálculo automático da Supri está configurado apenas
      para <strong>Rodoviário Dedicado (lotação)</strong>.
      Se quiser, dá pra estender depois para o fracionado usando a mesma ideia.</p>
    `;
    return;
  }

  calcularSupriDedicado(params, container);
});
