const { getPublicRegistrationConfig } = require("../lib/config");
const { sendJson } = require("../lib/http");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  return sendJson(response, 200, getPublicRegistrationConfig());
};
