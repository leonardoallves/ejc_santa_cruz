function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function readJsonBody(request) {
  if (typeof request.body === "object" && request.body !== null) {
    return request.body;
  }

  if (!request.body) {
    return {};
  }

  try {
    return JSON.parse(request.body);
  } catch (error) {
    return {};
  }
}

function parseCookies(request) {
  const cookieHeader = String(request.headers.cookie || "");

  return cookieHeader.split(";").reduce((accumulator, item) => {
    const [rawKey, ...rawValue] = item.trim().split("=");
    if (!rawKey) {
      return accumulator;
    }

    accumulator[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    return accumulator;
  }, {});
}

function setCookie(response, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.secure !== false) {
    parts.push("Secure");
  }

  parts.push(`Path=${options.path || "/"}`);
  parts.push(`SameSite=${options.sameSite || "Strict"}`);

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  response.setHeader("Set-Cookie", parts.join("; "));
}

module.exports = {
  parseCookies,
  readJsonBody,
  sendJson,
  setCookie
};
