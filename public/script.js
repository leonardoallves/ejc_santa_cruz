const codeForm = document.getElementById("code-form");
const registrationCard = document.getElementById("registration-card");
const registrationForm = document.getElementById("registration-form");
const registrationFields = document.getElementById("registration-fields");
const codeFeedback = document.getElementById("code-feedback");
const registrationFeedback = document.getElementById("registration-feedback");
const photoPreviewWrap = document.getElementById("photo-preview-wrap");
const photoPreviewImage = document.getElementById("photo-preview-image");

let registrationConfig = null;
let validatedCode = "";

function setFeedback(element, type, message) {
  element.className = `feedback ${type || ""}`.trim();
  element.textContent = message || "";
}

function setLoading(button, isLoading, loadingText, idleText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro inesperado.");
  }

  return data;
}

function createFieldElement(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "stack";

  const label = document.createElement("label");
  label.htmlFor = field.name;
  label.textContent = field.label;
  wrapper.appendChild(label);

  let input;

  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = field.rows || 4;
  } else {
    input = document.createElement("input");
    input.type = field.type;
  }

  input.id = field.name;
  input.name = field.name;

  if (field.required) {
    input.required = true;
  }

  if (field.maxLength) {
    input.maxLength = field.maxLength;
  }

  if (field.placeholder) {
    input.placeholder = field.placeholder;
  }

  if (field.accept) {
    input.accept = field.accept;
  }

  if (field.type === "file") {
    input.capture = "environment";
    input.addEventListener("change", handlePhotoPreview);
  }

  wrapper.appendChild(input);
  return wrapper;
}

function renderFields(fields) {
  registrationFields.innerHTML = "";
  fields.forEach((field) => {
    registrationFields.appendChild(createFieldElement(field));
  });
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Nao foi possivel ler a foto."));
    reader.readAsDataURL(file);
  });
}

function handlePhotoPreview(event) {
  const file = event.target.files?.[0];

  if (!file) {
    photoPreviewWrap.classList.add("hidden");
    photoPreviewImage.removeAttribute("src");
    return;
  }

  if (!registrationConfig.allowedPhotoTypes.includes(file.type)) {
    event.target.value = "";
    setFeedback(registrationFeedback, "error", "Formato de imagem nao permitido.");
    photoPreviewWrap.classList.add("hidden");
    photoPreviewImage.removeAttribute("src");
    return;
  }

  if (file.size > registrationConfig.photoMaxBytes) {
    event.target.value = "";
    setFeedback(registrationFeedback, "error", "A foto excede o tamanho maximo permitido.");
    photoPreviewWrap.classList.add("hidden");
    photoPreviewImage.removeAttribute("src");
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  photoPreviewImage.src = objectUrl;
  photoPreviewWrap.classList.remove("hidden");
  setFeedback(registrationFeedback, "", "");
}

async function loadConfig() {
  registrationConfig = await fetchJson("/api/registration-config", {
    method: "GET"
  });

  document.title = registrationConfig.pageTitle;
  document.getElementById("page-eyebrow").textContent = registrationConfig.pageEyebrow;
  document.getElementById("page-heading").textContent = registrationConfig.pageHeading;
  document.getElementById("page-description").textContent = registrationConfig.pageDescription;
  document.getElementById("code-label").textContent = registrationConfig.codeLabel;
  document.getElementById("code").placeholder = registrationConfig.codePlaceholder;
  document.getElementById("code").maxLength = registrationConfig.codeMaxLength;
  document.getElementById("code-button").textContent = registrationConfig.codeButtonLabel;
  renderFields(registrationConfig.fields);
}

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = document.getElementById("code-button");
  const codeInput = document.getElementById("code");
  const code = String(codeInput.value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, registrationConfig.codeMaxLength);

  codeInput.value = code;
  setFeedback(codeFeedback, "", "");
  setLoading(submitButton, true, "Validando...", registrationConfig.codeButtonLabel);

  try {
    const data = await fetchJson("/api/validate-code", {
      method: "POST",
      body: JSON.stringify({ code })
    });

    validatedCode = data.code;
    document.getElementById("validated-code").textContent = `Codigo validado: ${validatedCode}`;
    registrationCard.classList.remove("hidden");
    setFeedback(codeFeedback, "success", "Codigo validado. Preencha o formulario abaixo.");
    setFeedback(registrationFeedback, "", "");
    registrationForm.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    registrationCard.classList.add("hidden");
    validatedCode = "";
    setFeedback(codeFeedback, "error", error.message);
  } finally {
    setLoading(submitButton, false, "Validando...", registrationConfig.codeButtonLabel);
  }
});

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = document.getElementById("registration-button");
  const payload = {
    code: validatedCode
  };

  for (const field of registrationConfig.fields) {
    const element = document.getElementById(field.name);

    if (field.type === "file") {
      const file = element.files?.[0];
      if (file) {
        payload[field.name] = {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: await fileToDataUrl(file)
        };
      }
      continue;
    }

    payload[field.name] = element.value;
  }

  setFeedback(registrationFeedback, "", "");
  setLoading(submitButton, true, "Enviando...", "Concluir inscricao");

  try {
    const data = await fetchJson("/api/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    registrationForm.reset();
    validatedCode = "";
    photoPreviewWrap.classList.add("hidden");
    photoPreviewImage.removeAttribute("src");
    registrationCard.classList.add("hidden");
    setFeedback(
      codeFeedback,
      "success",
      `${data.message} Registrado em ${new Date(data.registration.createdAt).toLocaleString("pt-BR")}.`
    );
    setFeedback(registrationFeedback, "", "");
  } catch (error) {
    setFeedback(registrationFeedback, "error", error.message);
  } finally {
    setLoading(submitButton, false, "Enviando...", "Concluir inscricao");
  }
});

loadConfig().catch((error) => {
  setFeedback(codeFeedback, "error", error.message);
});
