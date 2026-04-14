const codeForm = document.getElementById("code-form");
const registrationCard = document.getElementById("registration-card");
const registrationForm = document.getElementById("registration-form");
const codeFeedback = document.getElementById("code-feedback");
const registrationFeedback = document.getElementById("registration-feedback");

function setFeedback(element, type, message) {
  element.className = `feedback ${type || ""}`.trim();
  element.textContent = message || "";
}

function setLoading(button, isLoading, loadingText, idleText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro inesperado.");
  }

  return data;
}

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = codeForm.querySelector("button");
  const code = document.getElementById("code").value.trim().toUpperCase();

  setFeedback(codeFeedback, "", "");
  setLoading(submitButton, true, "Validando...", "Validar codigo");

  try {
    const data = await postJson("/api/validate-code", { code });
    document.getElementById("confirmed-code").value = data.invite.code;
    document.getElementById("invite-holder").textContent = data.invite.holder;
    document.getElementById(
      "invite-group"
    ).textContent = `Grupo: ${data.invite.group} | Codigo: ${data.invite.code}`;

    registrationCard.classList.remove("hidden");

    if (data.alreadyConfirmed) {
      registrationForm.classList.add("hidden");
      setFeedback(
        codeFeedback,
        "success",
        "Este codigo ja foi confirmado. Se precisar ajustar algo, fale com a organizacao."
      );
      setFeedback(
        registrationFeedback,
        "success",
        `Confirmado em ${new Date(data.confirmation.confirmedAt).toLocaleString("pt-BR")}.`
      );
    } else {
      registrationForm.classList.remove("hidden");
      setFeedback(codeFeedback, "success", "Codigo validado. Preencha seus dados abaixo.");
      setFeedback(registrationFeedback, "", "");
    }
  } catch (error) {
    registrationCard.classList.add("hidden");
    registrationForm.classList.remove("hidden");
    setFeedback(codeFeedback, "error", error.message);
  } finally {
    setLoading(submitButton, false, "Validando...", "Validar codigo");
  }
});

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = registrationForm.querySelector("button");
  const payload = {
    code: document.getElementById("confirmed-code").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value
  };

  setFeedback(registrationFeedback, "", "");
  setLoading(submitButton, true, "Confirmando...", "Confirmar cadastro");

  try {
    const data = await postJson("/api/confirm", payload);
    registrationForm.reset();
    document.getElementById("confirmed-code").value = data.confirmation.code;
    registrationForm.classList.add("hidden");
    setFeedback(
      registrationFeedback,
      "success",
      `Cadastro confirmado com sucesso em ${new Date(data.confirmation.confirmedAt).toLocaleString("pt-BR")}.`
    );
  } catch (error) {
    setFeedback(registrationFeedback, "error", error.message);
  } finally {
    setLoading(submitButton, false, "Confirmando...", "Confirmar cadastro");
  }
});
