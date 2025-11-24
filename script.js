document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('freight-form');
  const levanteLink = document.getElementById('levante-link');
  const valorInput = document.getElementById('valor-nf');

  // --- MÁSCARA pt-BR PARA VALOR DA NF (ex: 18.402,42) ---
  if (valorInput) {
    valorInput.addEventListener('input', (e) => {
      let v = e.target.value;

      // mantém só dígitos
      v = v.replace(/\D/g, '');

      if (v === '') {
        e.target.value = '';
        return;
      }

      // transforma em centavos
      v = (parseInt(v, 10) / 100).toFixed(2) + '';

      // vírgula como separador decimal
      v = v.replace('.', ',');

      // pontos de milhar
      v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      e.target.value = v;
    });
  }

  // --- CLIQUE NO LOGO DA LEVANTE ---
  if (levanteLink) {
    levanteLink.addEventListener('click', (event) => {
      event.preventDefault();

      // validação HTML5
      if (!form.reportValidity()) {
        return;
      }

      const formData = new FormData(form);
      formData.append('transportadora', 'levante');

      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, value);
      }

      window.location.href = `levante.html?${params.toString()}`;
    });
  }

  // Futuro: implementar Supri
  // const supriLink = document.getElementById('supri-link');
});
