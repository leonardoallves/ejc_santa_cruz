const { inviteCodes } = require("../data/invite-codes");

const memoryStore = globalThis.__EJC_MEMORY_STORE__ || new Map();
globalThis.__EJC_MEMORY_STORE__ = memoryStore;

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvRequest(command, ...args) {
  const response = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ command, args })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha no KV (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

function confirmationKey(code) {
  return `ejc:confirmation:${String(code || "").trim().toUpperCase()}`;
}

async function getConfirmation(code) {
  const key = confirmationKey(code);

  if (isKvConfigured()) {
    const value = await kvRequest("GET", key);
    return value ? JSON.parse(value) : null;
  }

  return memoryStore.get(key) || null;
}

async function saveConfirmation(code, payload) {
  const key = confirmationKey(code);
  const serialized = JSON.stringify(payload);

  if (isKvConfigured()) {
    await kvRequest("SET", key, serialized);
    return;
  }

  memoryStore.set(key, payload);
}

async function listConfirmations() {
  const confirmations = [];

  for (const invite of inviteCodes) {
    const confirmation = await getConfirmation(invite.code);
    if (confirmation) {
      confirmations.push(confirmation);
    }
  }

  return confirmations.sort((a, b) => {
    return new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime();
  });
}

module.exports = {
  getConfirmation,
  isKvConfigured,
  listConfirmations,
  saveConfirmation
};
