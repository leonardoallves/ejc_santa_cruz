const { registrationConfig } = require("../lib/config");
const { assertValidCode } = require("../lib/codes");
const { readJsonBody, sendJson } = require("../lib/http");
const { getCode, getRegistrationByCode, isBlobConfigured } = require("../lib/storage");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  if (!isBlobConfigured()) {
    return sendJson(response, 500, {
      error: "BLOB_READ_WRITE_TOKEN nao configurado."
    });
  }

  const body = readJsonBody(request);
  const code = assertValidCode(body.code);

  if (!code) {
    return sendJson(response, 400, {
      error: registrationConfig.invalidCodeMessage
    });
  }

  const [storedCode, registration] = await Promise.all([
    getCode(code),
    getRegistrationByCode(code)
  ]);

  if (!storedCode || !storedCode.active || registration) {
    return sendJson(response, 404, {
      error: registrationConfig.invalidCodeMessage
    });
  }

  return sendJson(response, 200, {
    code
  });
};
