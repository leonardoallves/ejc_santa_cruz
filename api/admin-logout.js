const { clearAdminSession } = require("../lib/auth");
const { sendJson } = require("../lib/http");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  clearAdminSession(response);

  return sendJson(response, 200, {
    ok: true
  });
};
