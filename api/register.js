const crypto = require("crypto");
const { registrationConfig } = require("../lib/config");
const { assertValidCode } = require("../lib/codes");
const { readJsonBody, sendJson } = require("../lib/http");
const { syncRegistrationToNotion } = require("../lib/notion");
const {
  getCode,
  getRegistrationByCode,
  isBlobConfigured,
  saveRegistration,
  uploadPhoto
} = require("../lib/storage");
const { validateRegistrationPayload } = require("../lib/validation");

function parseBase64Image(photoPayload) {
  if (!photoPayload || typeof photoPayload.dataUrl !== "string") {
    return null;
  }

  const matches = photoPayload.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }

  return {
    contentType: matches[1],
    buffer: Buffer.from(matches[2], "base64")
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Metodo nao permitido." });
  }

  if (!isBlobConfigured()) {
    return sendJson(response, 500, {
      error: "BLOB_READ_WRITE_TOKEN nao configurado."
    });
  }

  const body = readJsonBody(request);
  const code = assertValidCode(body.code);

  if (!code) {
    return sendJson(response, 400, {
      error: registrationConfig.invalidCodeMessage
    });
  }

  const [storedCode, existingRegistration] = await Promise.all([
    getCode(code),
    getRegistrationByCode(code)
  ]);

  if (!storedCode || !storedCode.active || existingRegistration) {
    return sendJson(response, 409, {
      error: registrationConfig.invalidCodeMessage
    });
  }

  const validation = validateRegistrationPayload(body);
  if (!validation.isValid) {
    return sendJson(response, 400, {
      error: validation.errors[0]
    });
  }

  const photoField = body[registrationConfig.photoFieldName];
  const parsedPhoto = parseBase64Image(photoField);

  if (!parsedPhoto && registrationConfig.fields.find((field) => field.name === registrationConfig.photoFieldName)?.required) {
    return sendJson(response, 400, {
      error: "Envie uma foto valida."
    });
  }

  if (parsedPhoto) {
    if (!registrationConfig.allowedPhotoTypes.includes(parsedPhoto.contentType)) {
      return sendJson(response, 400, {
        error: "Formato de imagem nao permitido."
      });
    }

    if (parsedPhoto.buffer.length > registrationConfig.photoMaxBytes) {
      return sendJson(response, 400, {
        error: "A foto excede o tamanho maximo permitido."
      });
    }
  }

  const photo = parsedPhoto ? await uploadPhoto(parsedPhoto) : null;
  const registration = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    code,
    person: validation.values,
    photo: photo
      ? {
          pathname: photo.pathname,
          url: photo.url,
          contentType: photo.contentType
        }
      : null
  };

  await saveRegistration(registration);

  try {
    await syncRegistrationToNotion(registration);
  } catch (error) {
    console.error(error);
  }

  return sendJson(response, 201, {
    message: registrationConfig.successMessage,
    registration
  });
};
