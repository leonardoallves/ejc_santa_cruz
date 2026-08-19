const crypto = require("crypto");
const { parseCookies, setCookie } = require("./http");

const SESSION_COOKIE_NAME = "ejc_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-session-secret";
}

function signValue(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("hex");
}

function createSessionValue() {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${expiresAt}`;
  const signature = signValue(payload);
  return `${payload}.${signature}`;
}

function isAdminPasswordValid(password) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

function setAdminSession(response) {
  setCookie(response, SESSION_COOKIE_NAME, createSessionValue(), {
    maxAge: SESSION_DURATION_SECONDS
  });
}

function clearAdminSession(response) {
  setCookie(response, SESSION_COOKIE_NAME, "", {
    maxAge: 0
  });
}

function hasValidAdminSession(request) {
  const cookies = parseCookies(request);
  const sessionValue = cookies[SESSION_COOKIE_NAME];

  if (!sessionValue) {
    return false;
  }

  const [expiresAt, signature] = sessionValue.split(".");
  if (!expiresAt || !signature) {
    return false;
  }

  if (signature !== signValue(expiresAt)) {
    return false;
  }

  return Number(expiresAt) > Date.now();
}

function requireAdmin(request, response, sendJson) {
  if (!hasValidAdminSession(request)) {
    sendJson(response, 401, { error: "Nao autorizado." });
    return false;
  }

  return true;
}

module.exports = {
  clearAdminSession,
  hasValidAdminSession,
  isAdminPasswordValid,
  requireAdmin,
  setAdminSession
};
