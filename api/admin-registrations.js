const { requireAdmin } = require("../lib/auth");
const { sendJson } = require("../lib/http");
const { isBlobConfigured, listRegistrations } = require("../lib/storage");

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

  const registrations = await listRegistrations();

  return sendJson(response, 200, {
    total: registrations.length,
    registrations
  });
};
