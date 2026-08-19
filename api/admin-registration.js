const { requireAdmin } = require("../lib/auth");
const { assertValidCode } = require("../lib/codes");
const { sendJson } = require("../lib/http");
const { getRegistrationByCode, isBlobConfigured } = require("../lib/storage");

module.exports = async function handler(request, response) {
  if (!requireAdmin(request, response, sendJson)) {
    return;
  }

  if (!isBlobConfigured()) {
    return sendJson(response, 500, {
      error: "BLOB_READ_WRITE_TOKEN nao configurado."
    });
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  const code = assertValidCode(request.query.code);

  if (!code) {
    return sendJson(response, 400, { error: "Codigo invalido." });
  }

  const registration = await getRegistrationByCode(code);

  if (!registration) {
    return sendJson(response, 404, { error: "Inscricao nao encontrada." });
  }

  return sendJson(response, 200, {
    registration
  });
};
