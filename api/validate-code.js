const { findInviteByCode } = require("../data/invite-codes");
const { getConfirmation } = require("../lib/storage");
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

  const confirmation = await getConfirmation(invite.code);

  return sendJson(response, 200, {
    invite,
    alreadyConfirmed: Boolean(confirmation),
    confirmation
  });
};
