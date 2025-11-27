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
    return text
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
      if (!v) return e.target.value = "";

      v = (parseInt(v) / 100).toFixed(2) + '';
      v = v.replace('.', ',');
      v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      e.target.value = v;
    });
  }

  // -----------------------------------------------------------
  // 🔵 CARREGAR JSON E POPULAR <select> de ORIGEM / DESTINO
  // -----------------------------------------------------------
  const selectOrigem = document.getElementById("regiao-origem");
  const selectDestino = document.getElementById("regiao-destino");

  fetch("enderecoEmpresa.json")
    .then(res => res.json())
    .then(data => {
      data.forEach((item, index) => {
        const opt1 = document.createElement("option");
        opt1.value = index;
        opt1.textContent = item.REGIAO + " (" + item.APELIDO + ")";
        selectOrigem.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = index;
        opt2.textContent = item.REGIAO + " (" + item.APELIDO + ")";
        selectDestino.appendChild(opt2);
      });

      // seleção origem
      selectOrigem.addEventListener("change", () => {
        const idx = selectOrigem.value;
        if (!idx) return;

        origemSelecionada = true;

        const item = data[idx];

        document.getElementById("cep-origem").value = item.CEP;
        document.getElementById("uf-origem").value = item.REGIAO.split("-")[1].trim();
        document.getElementById("cidade-origem").value = removeAcentos(toUpper(item.REGIAO.split("-")[0].trim()));
        document.getElementById("end-origem").value = removeAcentos(toUpper(item.ENDERECO));
      });

      // seleção destino
      selectDestino.addEventListener("change", () => {
        const idx = selectDestino.value;
        if (!idx) return;

        destinoSelecionada = true;

        const item = data[idx];

        document.getElementById("cep-destino").value = item.CEP;
        document.getElementById("uf-destino").value = item.REGIAO.split("-")[1].trim();
        document.getElementById("cidade-destino").value = removeAcentos(toUpper(item.REGIAO.split("-")[0].trim()));
        document.getElementById("end-destino").value = removeAcentos(toUpper(item.ENDERECO));
      });
    });

  // ------------------------------------
  // NAVEGAÇÃO LEVANTE / SUPRI (igual estava)
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
});
