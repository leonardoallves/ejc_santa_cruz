const { findInviteByCode } = require("../data/invite-codes");
const { getConfirmation, saveConfirmation } = require("../lib/storage");
const { readJsonBody, sendJson } = require("../lib/http");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  const body = readJsonBody(request);
  const invite = findInviteByCode(body.code);

  if (!invite) {
    return sendJson(response, 404, { error: "Codigo nao encontrado." });
  }

  const existingConfirmation = await getConfirmation(invite.code);
  if (existingConfirmation) {
    return sendJson(response, 409, {
      error: "Este codigo ja foi utilizado.",
      confirmation: existingConfirmation
    });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();

  if (!name || !email || !phone) {
    return sendJson(response, 400, {
      error: "Preencha nome, email e telefone."
    });
  }

  const confirmation = {
    code: invite.code,
    holder: invite.holder,
    group: invite.group,
    participant: {
      name,
      email,
      phone,
      notes: String(body.notes || "").trim()
    },
    confirmedAt: new Date().toISOString()
  };

  await saveConfirmation(invite.code, confirmation);

  return sendJson(response, 201, {
    message: "Cadastro confirmado com sucesso.",
    confirmation
  });
};
