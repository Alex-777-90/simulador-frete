document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('freight-form');
  const levanteLink = document.getElementById('levante-link');
  const supriLink = document.getElementById('supri-link');
  const valorInput = document.getElementById('valor-nf');

  // --- MÁSCARA pt-BR PARA VALOR DA NF ---
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

  // botão "Verificar frete" continua funcionando normal (se quiser)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // por padrão, vamos abrir a Levante
      abrirSimulacao('levante.html');
    });
  }
});
