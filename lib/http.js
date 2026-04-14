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

module.exports = {
  readJsonBody,
  sendJson
};
