const crypto = require("crypto");
const { put, list } = require("@vercel/blob");
const { codeHash, normalizeCode } = require("./codes");

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function ensureBlobConfigured() {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN nao configurado.");
  }
}

function codePath(code) {
  return `codes/${codeHash(code)}.json`;
}

function registrationPath(code) {
  return `registrations/${codeHash(code)}.json`;
}

function photoPath(fileExtension) {
  return `photos/${crypto.randomUUID()}.${fileExtension}`;
}

async function putJson(pathname, payload) {
  ensureBlobConfigured();

  const blob = await put(pathname, JSON.stringify(payload, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return blob;
}

async function findBlobByPath(pathname) {
  ensureBlobConfigured();

  const result = await list({
    prefix: pathname,
    limit: 1,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return result.blobs.find((item) => item.pathname === pathname) || null;
}

async function readJsonByPath(pathname) {
  const blob = await findBlobByPath(pathname);

  if (!blob) {
    return null;
  }

  const response = await fetch(blob.url);
  if (!response.ok) {
    throw new Error(`Falha ao ler ${pathname}.`);
  }

  return response.json();
}

async function getCode(code) {
  return readJsonByPath(codePath(code));
}

async function saveCode(code, payload) {
  const normalizedCode = normalizeCode(code);
  return putJson(codePath(normalizedCode), {
    code: normalizedCode,
    active: payload.active !== false,
    createdAt: payload.createdAt || new Date().toISOString()
  });
}

async function setCodeActive(code, active) {
  const existingCode = await getCode(code);

  if (!existingCode) {
    return null;
  }

  await saveCode(code, {
    ...existingCode,
    active: Boolean(active)
  });

  return {
    ...existingCode,
    active: Boolean(active)
  };
}

async function listCodes() {
  ensureBlobConfigured();

  const result = await list({
    prefix: "codes/",
    limit: 1000,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  const codes = await Promise.all(
    result.blobs.map(async (blob) => {
      const response = await fetch(blob.url);
      return response.json();
    })
  );

  return codes.sort((a, b) => a.code.localeCompare(b.code, "pt-BR"));
}

async function getRegistrationByCode(code) {
  return readJsonByPath(registrationPath(code));
}

async function saveRegistration(registration) {
  await putJson(registrationPath(registration.code), registration);
  return registration;
}

async function listRegistrations() {
  ensureBlobConfigured();

  const result = await list({
    prefix: "registrations/",
    limit: 1000,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  const registrations = await Promise.all(
    result.blobs.map(async (blob) => {
      const response = await fetch(blob.url);
      return response.json();
    })
  );

  return registrations.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getFileExtensionFromContentType(contentType) {
  if (contentType === "image/jpeg") {
    return "jpg";
  }

  if (contentType === "image/png") {
    return "png";
  }

  return "webp";
}

async function uploadPhoto({ buffer, contentType }) {
  ensureBlobConfigured();

  const pathname = photoPath(getFileExtensionFromContentType(contentType));
  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return {
    pathname: blob.pathname,
    url: blob.url,
    contentType
  };
}

module.exports = {
  getCode,
  getRegistrationByCode,
  isBlobConfigured,
  listCodes,
  listRegistrations,
  saveCode,
  saveRegistration,
  setCodeActive,
  uploadPhoto
};
