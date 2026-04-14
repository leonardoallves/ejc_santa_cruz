const adminForm = document.getElementById("admin-form");
const adminFeedback = document.getElementById("admin-feedback");
const adminSummary = document.getElementById("admin-summary");
const confirmationsBody = document.getElementById("confirmations-body");

function setAdminFeedback(type, message) {
  adminFeedback.className = `feedback ${type || ""}`.trim();
  adminFeedback.textContent = message || "";
}

function renderRows(confirmations) {
  if (!confirmations.length) {
    confirmationsBody.innerHTML =
      '<tr><td colspan="6" class="empty-state">Nenhuma confirmacao encontrada.</td></tr>';
    return;
  }

  confirmationsBody.innerHTML = confirmations
    .map((item) => {
      return `
        <tr>
          <td>${item.code}</td>
          <td>${item.participant.name}</td>
          <td>${item.participant.email}</td>
          <td>${item.participant.phone}</td>
          <td>${item.group}</td>
          <td>${new Date(item.confirmedAt).toLocaleString("pt-BR")}</td>
        </tr>
      `;
    })
    .join("");
}

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = adminForm.querySelector("button");
  const token = document.getElementById("admin-token").value.trim();

  submitButton.disabled = true;
  submitButton.textContent = "Carregando...";
  setAdminFeedback("", "");

  try {
    const response = await fetch(`/api/confirmations?token=${encodeURIComponent(token)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao consultar confirmacoes.");
    }

    adminSummary.textContent = `${data.total} confirmacao(oes) | armazenamento: ${data.storage}`;
    renderRows(data.confirmations);
    setAdminFeedback("success", "Consulta realizada com sucesso.");
  } catch (error) {
    adminSummary.textContent = "Falha ao carregar os dados.";
    renderRows([]);
    setAdminFeedback("error", error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Carregar";
  }
});
