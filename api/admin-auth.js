const {
  clearAdminSession,
  hasValidAdminSession,
  isAdminPasswordValid,
  setAdminSession
} = require("../lib/auth");
const { readJsonBody, sendJson } = require("../lib/http");

module.exports = async function handler(request, response) {
  if (request.method === "GET") {
    return sendJson(response, 200, {
      authenticated: hasValidAdminSession(request)
    });
  }

  if (request.method === "POST") {
    if (!process.env.ADMIN_PASSWORD) {
      return sendJson(response, 500, {
        error: "ADMIN_PASSWORD nao configurada."
      });
    }

    const body = readJsonBody(request);
    const password = String(body.password || "");

    if (!isAdminPasswordValid(password)) {
      return sendJson(response, 401, { error: "Senha invalida." });
    }

    setAdminSession(response);

    return sendJson(response, 200, {
      ok: true
    });
  }

  if (request.method === "DELETE") {
    clearAdminSession(response);

    return sendJson(response, 200, {
      ok: true
    });
  }

  return sendJson(response, 405, { error: "Metodo nao permitido." });
};
