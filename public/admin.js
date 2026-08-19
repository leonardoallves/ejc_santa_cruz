const loginForm = document.getElementById("admin-login-form");
const adminFeedback = document.getElementById("admin-feedback");
const adminContent = document.getElementById("admin-content");
const logoutButton = document.getElementById("logout-button");
const codesBody = document.getElementById("codes-body");
const registrationsBody = document.getElementById("registrations-body");
const codesSummary = document.getElementById("codes-summary");
const registrationsSummary = document.getElementById("registrations-summary");
const registrationDetailCard = document.getElementById("registration-detail-card");
const registrationDetail = document.getElementById("registration-detail");
const detailCode = document.getElementById("detail-code");
const detailPhotoWrap = document.getElementById("detail-photo-wrap");
const detailPhoto = document.getElementById("detail-photo");
const downloadRegistrationButton = document.getElementById("download-registration-button");

let selectedRegistration = null;

function setFeedback(type, message) {
  adminFeedback.className = `feedback ${type || ""}`.trim();
  adminFeedback.textContent = message || "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchJson(url, options = {}) {
  const headers = options.headers || {};
  const hasBody = typeof options.body === "string";

  const response = await fetch(url, {
    ...options,
    headers: hasBody
      ? {
          "Content-Type": "application/json",
          ...headers
        }
      : headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro inesperado.");
  }

  return data;
}

function normalizeCodeInput(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderCodes(codes) {
  if (!codes.length) {
    codesBody.innerHTML =
      '<tr><td colspan="4" class="empty-state">Nenhum codigo cadastrado.</td></tr>';
    return;
  }

  codesBody.innerHTML = codes
    .map((item) => {
      const actionLabel = item.active ? "Desativar" : "Ativar";
      const disabled = item.status === "used" ? "disabled" : "";

      return `
        <tr>
          <td>${escapeHtml(item.code)}</td>
          <td><span class="status-badge ${item.status}">${item.status}</span></td>
          <td>${new Date(item.createdAt).toLocaleString("pt-BR")}</td>
          <td>
            <button class="table-button" data-toggle-code="${escapeHtml(item.code)}" ${disabled}>
              ${actionLabel}
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  codesBody.querySelectorAll("[data-toggle-code]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.getAttribute("data-toggle-code");
      const row = codes.find((item) => item.code === code);

      if (!row || row.status === "used") {
        return;
      }

      button.disabled = true;

      try {
        await fetchJson("/api/admin-code", {
          method: "PATCH",
          body: JSON.stringify({
            code,
            active: !row.active
          })
        });

        await loadAdminData();
        setFeedback("success", `Codigo ${code} atualizado com sucesso.`);
      } catch (error) {
        setFeedback("error", error.message);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderRegistrationDetail(registration) {
  selectedRegistration = registration;
  detailCode.textContent = `Codigo ${registration.code}`;
  registrationDetail.innerHTML = "";

  Object.entries(registration.person).forEach(([key, value]) => {
    const item = document.createElement("div");
    item.className = "detail-item";
    const title = document.createElement("strong");
    title.textContent = key;
    const text = document.createElement("span");
    text.textContent = value || "-";
    item.appendChild(title);
    item.appendChild(text);
    registrationDetail.appendChild(item);
  });

  const createdAt = document.createElement("div");
  createdAt.className = "detail-item";
  createdAt.innerHTML = `<strong>createdAt</strong><span>${new Date(registration.createdAt).toLocaleString("pt-BR")}</span>`;
  registrationDetail.appendChild(createdAt);

  if (registration.photo?.url) {
    detailPhoto.src = registration.photo.url;
    detailPhotoWrap.classList.remove("hidden");
  } else {
    detailPhotoWrap.classList.add("hidden");
    detailPhoto.removeAttribute("src");
  }

  registrationDetailCard.classList.remove("hidden");
}

function renderRegistrations(registrations) {
  if (!registrations.length) {
    registrationsBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Nenhuma inscricao encontrada.</td></tr>';
    return;
  }

  registrationsBody.innerHTML = registrations
    .map((item) => {
      return `
        <tr class="clickable-row" data-registration-code="${escapeHtml(item.code)}">
          <td>${escapeHtml(item.code)}</td>
          <td>${escapeHtml(item.person.name || "-")}</td>
          <td>${escapeHtml(item.person.phone || "-")}</td>
          <td>${new Date(item.createdAt).toLocaleString("pt-BR")}</td>
          <td><span class="status-badge used">inscrito</span></td>
        </tr>
      `;
    })
    .join("");

  registrationsBody.querySelectorAll("[data-registration-code]").forEach((row) => {
    row.addEventListener("click", async () => {
      const code = row.getAttribute("data-registration-code");

      try {
        const data = await fetchJson(`/api/admin-registration?code=${encodeURIComponent(code)}`, {
          method: "GET"
        });
        renderRegistrationDetail(data.registration);
      } catch (error) {
        setFeedback("error", error.message);
      }
    });
  });
}

async function loadAdminData() {
  const [codesData, registrationsData] = await Promise.all([
    fetchJson("/api/admin-codes", { method: "GET" }),
    fetchJson("/api/admin-registrations", { method: "GET" })
  ]);

  renderCodes(codesData.codes);
  renderRegistrations(registrationsData.registrations);

  const availableCount = codesData.codes.filter((item) => item.status === "available").length;
  const usedCount = codesData.codes.filter((item) => item.status === "used").length;

  codesSummary.textContent = `${codesData.codes.length} codigos | ${availableCount} disponiveis | ${usedCount} utilizados`;
  registrationsSummary.textContent = `${registrationsData.total} inscricao(oes) concluida(s)`;
}

async function loadSession() {
  const session = await fetchJson("/api/admin-session", {
    method: "GET"
  });

  if (!session.authenticated) {
    adminContent.classList.add("hidden");
    logoutButton.classList.add("hidden");
    return;
  }

  loginForm.classList.add("hidden");
  adminContent.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
  await loadAdminData();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const loginButton = document.getElementById("login-button");
  const password = document.getElementById("admin-password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Entrando...";
  setFeedback("", "");

  try {
    await fetchJson("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password })
    });

    loginForm.reset();
    await loadSession();
    setFeedback("success", "Autenticacao realizada com sucesso.");
  } catch (error) {
    setFeedback("error", error.message);
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Entrar";
  }
});

document.getElementById("create-code-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const input = document.getElementById("new-code");
  const code = normalizeCodeInput(input.value);
  input.value = code;

  try {
    const data = await fetchJson("/api/admin-codes", {
      method: "POST",
      body: JSON.stringify({ code })
    });

    input.value = "";
    await loadAdminData();
    setFeedback("success", `Codigo ${data.code} criado com sucesso.`);
  } catch (error) {
    setFeedback("error", error.message);
  }
});

document.getElementById("generate-code-button").addEventListener("click", async () => {
  try {
    const data = await fetchJson("/api/admin-codes", {
      method: "POST",
      body: JSON.stringify({})
    });

    await loadAdminData();
    setFeedback("success", `Codigo ${data.code} criado com sucesso.`);
  } catch (error) {
    setFeedback("error", error.message);
  }
});

document.getElementById("export-button").addEventListener("click", async () => {
  try {
    const data = await fetchJson("/api/admin-export", {
      method: "GET"
    });

    downloadJson(`inscricoes-${new Date().toISOString().slice(0, 10)}.json`, data);
    setFeedback("success", "Exportacao concluida.");
  } catch (error) {
    setFeedback("error", error.message);
  }
});

downloadRegistrationButton.addEventListener("click", () => {
  if (!selectedRegistration) {
    return;
  }

  downloadJson(`inscricao-${selectedRegistration.code}.json`, selectedRegistration);
});

logoutButton.addEventListener("click", async () => {
  try {
    await fetchJson("/api/admin-logout", {
      method: "POST",
      body: JSON.stringify({})
    });

    adminContent.classList.add("hidden");
    loginForm.classList.remove("hidden");
    logoutButton.classList.add("hidden");
    registrationDetailCard.classList.add("hidden");
    selectedRegistration = null;
    setFeedback("success", "Sessao encerrada.");
  } catch (error) {
    setFeedback("error", error.message);
  }
});

loadSession().catch((error) => {
  setFeedback("error", error.message);
});
