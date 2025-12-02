let menuOpcoesGlobal = null; // usado pelo menu suspenso

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('freight-form');
  const valorInput = document.getElementById('valor-nf');

  // ----------------------------------------------------------------
  // CONTROLES PARA BLOQUEAR ViaCEP quando origem/destino vem do JSON
  // ----------------------------------------------------------------
  let origemSelecionada = false;
  let destinoSelecionada = false;

  // ------------------------------------
  // MAIÚSCULO
  function toUpper(value) {
    return (value || "").toString().toUpperCase();
  }

  // ------------------------------------
  // REMOVER ACENTOS
  function removeAcentos(text) {
    return (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // ------------------------------------
  // FORMATAÇÃO DE CEP PARA DIGITAÇÃO -> 00000-000
  function formatCEP(value) {
    let v = (value || "").replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    return v;
  }

  // ------------------------------------
  // NORMALIZAR CEP VINDO DO JSON (adicionar zero à esquerda)
  // ------------------------------------
  function normalizeCEPFromJson(cepValor) {
    let v = (cepValor ?? "").toString().replace(/\D/g, "");

    if (!v) return "";

    // se vier com menos de 8 dígitos, completa com zero à esquerda
    if (v.length < 8) {
      v = v.padStart(8, "0");
    } else if (v.length > 8) {
      // se por acaso vier maior, pega os 8 últimos
      v = v.slice(-8);
    }

    // devolve já no formato 00000-000
    return v.slice(0, 5) + "-" + v.slice(5);
  }

  // ------------------------------------
  //  VIA CEP (somente se usuário digitar)
  // ------------------------------------
  async function consultarCEP(cep, tipo) {
    // não chamar API se veio da seleção JSON
    if (tipo === "origem" && origemSelecionada) return;
    if (tipo === "destino" && destinoSelecionada) return;

    cep = (cep || "").replace(/\D/g, '');
    if (cep.length !== 8) return;

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado!");
        return;
      }

      const ufInput = document.getElementById(`uf-${tipo}`);
      const cidadeInput = document.getElementById(`cidade-${tipo}`);
      const endInput = document.getElementById(`end-${tipo}`);

      if (ufInput) ufInput.value = removeAcentos(toUpper(data.uf));
      if (cidadeInput) cidadeInput.value = removeAcentos(toUpper(data.localidade));

      let enderecoCompleto = `${data.logradouro || ""}`;
      if (data.bairro) {
        enderecoCompleto += ` - ${data.bairro}`;
      }

      if (endInput) {
        endInput.value = removeAcentos(toUpper(enderecoCompleto.trim()));
      }

    } catch (error) {
      console.log("Erro ao consultar CEP:", error);
    }
  }

  // ------------------------------------
  // MÁSCARA + CONSULTA CEP
  // ------------------------------------
  function configurarCampoCEP(input, tipo) {
    if (!input) return;

    input.addEventListener("input", () => {
      input.value = formatCEP(input.value);

      // se o usuário alterar o CEP → desativa JSON
      if (tipo === "origem") origemSelecionada = false;
      if (tipo === "destino") destinoSelecionada = false;
    });

    input.addEventListener("blur", () => {
      input.value = formatCEP(input.value);
      consultarCEP(input.value, tipo);
    });
  }

  const cepOrigem = document.getElementById("cep-origem");
  const cepDestino = document.getElementById("cep-destino");

  configurarCampoCEP(cepOrigem, "origem");
  configurarCampoCEP(cepDestino, "destino");

  // ------------------------------------
  // CAMPOS SEM ACENTO + MAIÚSCULO
  // ------------------------------------
  const padronizar = [
    'uf-origem', 'cidade-origem', 'end-origem',
    'uf-destino', 'cidade-destino', 'end-destino'
  ];

  padronizar.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        el.value = removeAcentos(toUpper(el.value));
      });
    }
  });

  // ------------------------------------
  // VALOR NF MÁSCARA
  // ------------------------------------
  if (valorInput) {
    valorInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (!v) {
        e.target.value = "";
        return;
      }

      v = (parseInt(v, 10) / 100).toFixed(2) + '';
      v = v.replace('.', ',');
      v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      e.target.value = v;
    });
  }

  // -----------------------------------------------------------
  // 🔵 CARREGAR JSON E POPULAR <select> de ORIGEM (ARMAZÉM)
  // -----------------------------------------------------------
  const selectOrigem = document.getElementById("regiao-origem");
  const selectDestino = document.getElementById("regiao-destino");

  // ORIGEM → enderecoEmpresa.json
  fetch("enderecoEmpresa.json")
    .then(res => res.json())
    .then(data => {
      data.forEach((item, index) => {
        const opt1 = document.createElement("option");
        opt1.value = index;
        opt1.textContent = item.REGIAO + " (" + item.APELIDO + ")";
        selectOrigem.appendChild(opt1);
      });

      // seleção origem
      selectOrigem.addEventListener("change", () => {
        const idx = selectOrigem.value;
        if (idx === "") return;

        origemSelecionada = true;

        const item = data[idx];

        document.getElementById("cep-origem").value = item.CEP;
        document.getElementById("uf-origem").value =
          removeAcentos(toUpper(item.REGIAO.split("-")[1].trim()));
        document.getElementById("cidade-origem").value =
          removeAcentos(toUpper(item.REGIAO.split("-")[0].trim()));
        document.getElementById("end-origem").value =
          removeAcentos(toUpper(item.ENDERECO));
      });
    });

  // -----------------------------------------------------------
  // 🔵 DESTINO (CLIENTE) → Clientes.json (novo formato)
  //   - formato: [ [header...], [linha1...], [linha2...] ]
  //   - ordena alfabeticamente
  //   - adiciona campo de busca por nome
  //   - usa "Nome estrangeiro" (fallback para outros campos)
  //   - CEP vem do JSON e é corrigido com zero à esquerda
  // -----------------------------------------------------------
  let listaClientes = [];

  fetch("Clientes.json") // novo arquivo em formato tabular
    .then(res => res.json())
    .then(json => {
      if (!Array.isArray(json) || json.length < 2) return;

      const header = json[0];       // primeira linha = nomes de coluna
      const linhas = json.slice(1); // demais linhas = registros

      // converte cada linha em objeto {coluna: valor}
      listaClientes = linhas.map(linha => {
        const obj = {};
        header.forEach((col, i) => {
          obj[col] = linha[i];
        });
        return obj;
      });

      // guarda e ordena alfabeticamente
      listaClientes.sort((a, b) => {
        const nomeA = (
          a["Nome estrangeiro"] ||
          a["Nome do PN"] ||
          a["Nome fantasia"] ||
          a["Código do PN"] ||
          ""
        ).toString().toUpperCase();

        const nomeB = (
          b["Nome estrangeiro"] ||
          b["Nome do PN"] ||
          b["Nome fantasia"] ||
          b["Código do PN"] ||
          ""
        ).toString().toUpperCase();

        return nomeA.localeCompare(nomeB);
      });

      // cria input de busca acima do select (sem mexer no HTML)
      const inputBusca = document.createElement("input");
      inputBusca.type = "text";
      inputBusca.placeholder = "Digite para buscar o cliente";
      inputBusca.className = "input-busca-cliente";

      if (selectDestino.parentNode) {
        selectDestino.parentNode.insertBefore(inputBusca, selectDestino);
      }

      // função para preencher o select (com ou sem filtro)
      function preencherSelectClientes(filtroTexto = "") {
        const textoFiltro = removeAcentos(filtroTexto.toUpperCase());

        // limpa e recria opção padrão
        selectDestino.innerHTML = '<option value="">Selecione um cliente</option>';

        listaClientes.forEach((cli, index) => {
          const nomeEstrangeiro = cli["Nome estrangeiro"];
          const nomePn = cli["Nome do PN"];
          const nomeFantasia = cli["Nome fantasia"];
          const codPn = cli["Código do PN"];

          const nome =
            nomeEstrangeiro ||
            nomePn ||
            nomeFantasia ||
            codPn ||
            `Cliente ${index + 1}`;

          const nomeNormalizado = removeAcentos(nome.toUpperCase());

          if (textoFiltro && !nomeNormalizado.includes(textoFiltro)) {
            return; // não entra no filtro
          }

          const opt = document.createElement("option");
          // value = índice na lista ordenada
          opt.value = index;
          opt.textContent = nome;
          selectDestino.appendChild(opt);
        });
      }

      // preenche inicialmente sem filtro
      preencherSelectClientes("");

      // evento de digitação no campo de busca
      inputBusca.addEventListener("input", () => {
        preencherSelectClientes(inputBusca.value);
      });

      // quando selecionar um cliente
      selectDestino.addEventListener("change", () => {
        const idx = selectDestino.value;
        if (idx === "") return;

        destinoSelecionada = true;

        const cli = listaClientes[idx];

        const uf = cli["UF"] ? cli["UF"].toString().trim() : "";
        const cidade = cli["Cidade"] ? cli["Cidade"].toString() : "";
        const cepJson = normalizeCEPFromJson(cli["CEP"]);

        const ufInput = document.getElementById("uf-destino");
        const cidadeInput = document.getElementById("cidade-destino");
        const cepInput = document.getElementById("cep-destino");
        const endInput = document.getElementById("end-destino");

        // UF e Cidade vindos do JSON (sem acento e em maiúsculo)
        if (ufInput) ufInput.value = removeAcentos(toUpper(uf));
        if (cidadeInput) cidadeInput.value = removeAcentos(toUpper(cidade));

        // CEP vindo do JSON (corrigido com zero à esquerda)
        if (cepInput) cepInput.value = cepJson;

        // Endereço ainda em branco (até você colocar no JSON)
        if (endInput) endInput.value = "";
      });
    });

  // ------------------------------------
  // MENU SUSPENSO DO BOTÃO "VERIFICAR FRETE"
  // ------------------------------------
  const botaoFrete = document.querySelector(".actions button");
  const menuOpcoes = document.getElementById("menu-opcoes");
  menuOpcoesGlobal = menuOpcoes;

  if (botaoFrete && menuOpcoes) {
    botaoFrete.addEventListener("click", function (e) {
      e.preventDefault(); // impede submit imediato
      menuOpcoes.classList.toggle("show");
    });

    // fecha o menu se clicar fora
    document.addEventListener("click", function (event) {
      if (!menuOpcoes.classList.contains("show")) return;

      const clickedInsideMenu = menuOpcoes.contains(event.target);
      const clickedButton = botaoFrete.contains(event.target);

      if (!clickedInsideMenu && !clickedButton) {
        menuOpcoes.classList.remove("show");
      }
    });
  }
});

// -----------------------------------------------------------
// AÇÃO AO CLICAR NO ITEM DO MENU (LEVANTE / SUPRI / AGRO ...)
// -----------------------------------------------------------
function selecionarTransportadora(tipo) {
  const form = document.getElementById("freight-form");
  if (!form) return;

  // valida campos do formulário
  if (!form.reportValidity()) {
    if (menuOpcoesGlobal) menuOpcoesGlobal.classList.remove("show");
    return;
  }

  const formData = new FormData(form);
  const params = new URLSearchParams();
  for (const [k, v] of formData.entries()) {
    params.append(k, v);
  }

  if (tipo === "LEVANTE") {
    window.location.href = "levante.html?" + params.toString();
  } else if (tipo === "SUPRI") {
    window.location.href = "supri.html?" + params.toString();
  } else {
    // futuros cálculos específicos
    alert("Função ainda não implementada para: " + tipo);
  }

  if (menuOpcoesGlobal) {
    menuOpcoesGlobal.classList.remove("show");
  }
}

// Alias para não quebrar nada se alguma <li> ainda chamar selecionarOpcao()
function selecionarOpcao(opcao) {
  selecionarTransportadora(opcao);
}
