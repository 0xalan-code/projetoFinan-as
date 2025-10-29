document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("listaTransacoes");
  const saldoEl = document.getElementById("saldo");
  const entradasEl = document.getElementById("entradas");
  const saidasEl = document.getElementById("saidas");

  function atualizarInterface() {
    const transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

    lista.innerHTML = "";

    let totalEntradas = 0;
    let totalSaidas = 0;

    transacoes.forEach((t) => {
      const li = document.createElement("li");
      li.classList.add("item-transacao");
      li.innerHTML = `
        <span>${t.descricao} <small>(${t.categoria})</small></span>
        <span class="${t.tipo === 'entrada' ? 'positivo' : 'negativo'}">
          ${t.tipo === 'entrada' ? '+' : '-'} R$ ${t.valor.toFixed(2)}
        </span>
      `;
      lista.appendChild(li);

      if (t.tipo === "entrada") totalEntradas += t.valor;
      else totalSaidas += t.valor;
    });

    const saldo = totalEntradas - totalSaidas;

    entradasEl.textContent = `R$ ${totalEntradas.toFixed(2)}`;
    saidasEl.textContent = `R$ ${totalSaidas.toFixed(2)}`;
    saldoEl.textContent = `R$ ${saldo.toFixed(2)}`;
    saldoEl.style.color = saldo >= 0 ? "#5af78e" : "#ff5555";
  }

  atualizarInterface();
});
