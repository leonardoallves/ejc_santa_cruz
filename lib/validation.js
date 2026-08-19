const { registrationConfig } = require("./config");

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDateValid(value) {
  if (!value) {
    return true;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function getFieldConfig(name) {
  return registrationConfig.fields.find((field) => field.name === name) || null;
}

function validateRegistrationPayload(payload) {
  const values = {};
  const errors = [];

  for (const field of registrationConfig.fields) {
    if (field.type === "file") {
      continue;
    }

    const rawValue = payload[field.name];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (field.required && !value) {
      errors.push(`Preencha o campo ${field.label}.`);
      continue;
    }

    if (field.maxLength && value.length > field.maxLength) {
      errors.push(`O campo ${field.label} excede o limite permitido.`);
      continue;
    }

    if (field.type === "email" && value && !isEmailValid(value)) {
      errors.push("Informe um e-mail valido.");
      continue;
    }

    if (field.type === "date" && value && !isDateValid(value)) {
      errors.push(`Informe uma data valida em ${field.label}.`);
      continue;
    }

    values[field.name] = field.type === "email" ? value.toLowerCase() : value;
  }

  return {
    isValid: errors.length === 0,
    errors,
    values
  };
}

module.exports = {
  getFieldConfig,
  validateRegistrationPayload
};
