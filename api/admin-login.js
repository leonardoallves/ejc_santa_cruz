const { isAdminPasswordValid, setAdminSession } = require("../lib/auth");
const { readJsonBody, sendJson } = require("../lib/http");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
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
};
