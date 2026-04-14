const { listConfirmations, isKvConfigured } = require("../lib/storage");
const { sendJson } = require("../lib/http");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  const token = String(request.query.token || "");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return sendJson(response, 401, { error: "Nao autorizado." });
  }

  const confirmations = await listConfirmations();

  return sendJson(response, 200, {
    storage: isKvConfigured() ? "vercel-kv" : "memoria-local",
    total: confirmations.length,
    confirmations
  });
};
