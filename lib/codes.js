const crypto = require("crypto");
const { registrationConfig } = require("./config");

function normalizeCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, registrationConfig.codeMaxLength);
}

function isCodeFormatValid(code) {
  return registrationConfig.allowedCodePattern.test(code);
}

function assertValidCode(code) {
  const normalizedCode = normalizeCode(code);
  if (!isCodeFormatValid(normalizedCode)) {
    return null;
  }

  return normalizedCode;
}

function codeHash(code) {
  return crypto.createHash("sha256").update(normalizeCode(code)).digest("hex");
}

function createRandomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  while (code.length < registrationConfig.codeMaxLength) {
    const byte = crypto.randomBytes(1)[0];
    code += alphabet[byte % alphabet.length];
  }

  return code;
}

module.exports = {
  assertValidCode,
  codeHash,
  createRandomCode,
  isCodeFormatValid,
  normalizeCode
};
