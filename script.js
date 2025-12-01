let menuOpcoesGlobal = null; // usado pela função selecionarOpcao

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('freight-form');
  const levanteLink = document.getElementById('levante-link');
  const supriLink = document.getElementById('supri-link');
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
  // FORMATAÇÃO DE CEP -> 00000-000
  function formatCEP(value) {
    let v = (value || "").replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    return v;
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
  // 🔵 DESTINO (CLIENTE) → clientes.json
  //   - ordena alfabeticamente
  //   - adiciona campo de busca por nome
  //   - usa "Nome estrangeiro" (fallback para outros campos)
  //   - CEP e Endereço ficam zerados
  // -----------------------------------------------------------
  let listaClientes = [];

  fetch("clientes.json")
    .then(res => res.json())
    .then(clientes => {
      // guarda e ordena alfabeticamente
      listaClientes = clientes.slice().sort((a, b) => {
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

        const ufInput = document.getElementById("uf-destino");
        const cidadeInput = document.getElementById("cidade-destino");
        const cepInput = document.getElementById("cep-destino");
        const endInput = document.getElementById("end-destino");

        // UF e Cidade vindos do JSON (sem acento e em maiúsculo)
        if (ufInput) ufInput.value = removeAcentos(toUpper(uf));
        if (cidadeInput) cidadeInput.value = removeAcentos(toUpper(cidade));

        // CEP e Endereço ficam zerados por enquanto
        if (cepInput) cepInput.value = "";
        if (endInput) endInput.value = "";
      });
    });

  // ------------------------------------
  // NAVEGAÇÃO LEVANTE / SUPRI
  // ------------------------------------
  function abrirSimulacao(nomePagina) {
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [k, v] of formData.entries()) {
      params.append(k, v);
    }
    window.location.href = `${nomePagina}?${params.toString()}`;
  }

  if (levanteLink) {
    levanteLink.addEventListener('click', e => {
      e.preventDefault();
      abrirSimulacao('levante.html');
    });
  }

  if (supriLink) {
    supriLink.addEventListener('click', e => {
      e.preventDefault();
      abrirSimulacao('supri.html');
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      abrirSimulacao('levante.html');
    });
  }

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

    // (opcional) fecha o menu se clicar fora
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

// Ação ao clicar em AGRO / ADITIVO / BLENDA
function selecionarOpcao(opcao) {
  alert("Você selecionou: " + opcao);

  if (menuOpcoesGlobal) {
    menuOpcoesGlobal.classList.remove("show");
  }

  // Aqui você coloca qualquer ação que desejar
  // Exemplo de redirecionamento por opção:
  // if (opcao === "AGRO")   window.location.href = "agro.html";
  // if (opcao === "ADITIVO") window.location.href = "aditivo.html";
  // if (opcao === "BLENDA")  window.location.href = "blenda.html";
}
