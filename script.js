document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('freight-form');
  const levanteLink = document.getElementById('levante-link');
  const supriLink = document.getElementById('supri-link');
  const valorInput = document.getElementById('valor-nf');

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
    let v = (value || "").replace(/\D/g, ""); // só números
    if (v.length > 8) v = v.slice(0, 8);      // limita em 8 dígitos

    if (v.length > 5) {
      v = v.slice(0, 5) + "-" + v.slice(5);
    }
    return v;
  }

  // -------------------------------
  // 🔵 VIA CEP
  // -------------------------------
  async function consultarCEP(cep, tipo) {
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
  // APLICA MÁSCARA + CHAMA VIA CEP NO BLUR
  // ------------------------------------
  function configurarCampoCEP(input, tipo) {
    if (!input) return;

    // enquanto digita / cola
    input.addEventListener("input", () => {
      input.value = formatCEP(input.value);
    });

    // quando sai do campo: garante formato e consulta ViaCEP
    input.addEventListener("blur", () => {
      input.value = formatCEP(input.value);
      consultarCEP(input.value, tipo);
    });
  }

  const cepOrigem = document.getElementById("cep-origem");
  const cepDestino = document.getElementById("cep-destino");

  configurarCampoCEP(cepOrigem, "origem");
  configurarCampoCEP(cepDestino, "destino");

  // -------------------------------
  // 🔠 FORÇAR MAIÚSCULO E SEM ACENTO NOS CAMPOS EDITÁVEIS
  // -------------------------------
  const camposPadronizados = [
    'uf-origem',
    'cidade-origem',
    'end-origem',
    'uf-destino',
    'cidade-destino',
    'end-destino'
  ];

  camposPadronizados.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        el.value = removeAcentos(toUpper(el.value));
      });
    }
  });

  // -------------------------------
  // 🟦 MÁSCARA VALOR NF
  // -------------------------------
  if (valorInput) {
    valorInput.addEventListener('input', (e) => {
      let v = e.target.value;
      v = v.replace(/\D/g, '');
      if (v === '') {
        e.target.value = '';
        return;
      }
      v = (parseInt(v, 10) / 100).toFixed(2) + '';
      v = v.replace('.', ',');
      v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      e.target.value = v;
    });
  }

  // -------------------------------
  // NAVEGAÇÃO LEVANTE / SUPRI
  // -------------------------------
  function abrirSimulacao(nomePagina) {
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, value);
    }

    window.location.href = `${nomePagina}?${params.toString()}`;
  }

  if (levanteLink) {
    levanteLink.addEventListener('click', (e) => {
      e.preventDefault();
      abrirSimulacao('levante.html');
    });
  }

  if (supriLink) {
    supriLink.addEventListener('click', (e) => {
      e.preventDefault();
      abrirSimulacao('supri.html');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      abrirSimulacao('levante.html');
    });
  }
});
