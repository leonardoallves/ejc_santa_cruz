const { requireAdmin } = require("../lib/auth");
const { registrationConfig } = require("../lib/config");
const { assertValidCode, createRandomCode } = require("../lib/codes");
const { readJsonBody, sendJson } = require("../lib/http");
const {
  getCode,
  getRegistrationByCode,
  isBlobConfigured,
  listCodes,
  saveCode
} = require("../lib/storage");

async function buildCodeRows() {
  const codes = await listCodes();

  return Promise.all(
    codes.map(async (codeItem) => {
      const registration = await getRegistrationByCode(codeItem.code);

      return {
        ...codeItem,
        status: registration ? "used" : codeItem.active ? "available" : "inactive",
        registration
      };
    })
  );
}

module.exports = async function handler(request, response) {
  if (!requireAdmin(request, response, sendJson)) {
    return;
  }

  if (!isBlobConfigured()) {
    return sendJson(response, 500, {
      error: "BLOB_READ_WRITE_TOKEN nao configurado."
    });
  }

  if (request.method === "GET") {
    const codes = await buildCodeRows();
    return sendJson(response, 200, { codes });
  }

  if (request.method === "POST") {
    const body = readJsonBody(request);
    const requestedCode = body.code ? assertValidCode(body.code) : null;
    const code = requestedCode || createRandomCode();

    if (!code) {
      return sendJson(response, 400, {
        error: `Informe um codigo com ate ${registrationConfig.codeMaxLength} caracteres alfanumericos.`
      });
    }

    const existingCode = await getCode(code);
    if (existingCode) {
      return sendJson(response, 409, {
        error: "Este codigo ja existe."
      });
    }

    await saveCode(code, {
      code,
      active: true,
      createdAt: new Date().toISOString()
    });

    return sendJson(response, 201, { code });
  }

  return sendJson(response, 405, { error: "Metodo nao permitido." });
};
