const { requireAdmin } = require("../lib/auth");
const { assertValidCode } = require("../lib/codes");
const { readJsonBody, sendJson } = require("../lib/http");
const { isBlobConfigured, setCodeActive } = require("../lib/storage");

module.exports = async function handler(request, response) {
  if (!requireAdmin(request, response, sendJson)) {
    return;
  }

  if (!isBlobConfigured()) {
    return sendJson(response, 500, {
      error: "BLOB_READ_WRITE_TOKEN nao configurado."
    });
  }

  if (request.method !== "PATCH") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  const body = readJsonBody(request);
  const code = assertValidCode(body.code);

  if (!code) {
    return sendJson(response, 400, { error: "Codigo invalido." });
  }

  const updatedCode = await setCodeActive(code, body.active);

  if (!updatedCode) {
    return sendJson(response, 404, { error: "Codigo nao encontrado." });
  }

  return sendJson(response, 200, {
    code: updatedCode
  });
};
