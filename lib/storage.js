const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { put, list } = require("@vercel/blob");
const { codeHash, normalizeCode } = require("./codes");

const LOCAL_STORAGE_ROOT = path.join(process.cwd(), "data", ".local-storage");

function isLocalStorageEnabled() {
  return process.env.STORAGE_PROVIDER === "local";
}

function isBlobStorageEnabled() {
  return process.env.STORAGE_PROVIDER !== "local" && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isBlobConfigured() {
  return isBlobStorageEnabled() || isLocalStorageEnabled();
}

function ensureBlobConfigured() {
  if (!isBlobConfigured()) {
    throw new Error("Configure BLOB_READ_WRITE_TOKEN ou defina STORAGE_PROVIDER=local para desenvolvimento.");
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

function localPath(pathname) {
  return path.join(LOCAL_STORAGE_ROOT, ...pathname.split("/"));
}

async function ensureLocalDirectory(pathname) {
  await fs.mkdir(path.dirname(localPath(pathname)), {
    recursive: true
  });
}

async function putLocalJson(pathname, payload) {
  await ensureLocalDirectory(pathname);
  await fs.writeFile(localPath(pathname), JSON.stringify(payload, null, 2), "utf-8");

  return {
    pathname,
    url: `local://${pathname}`
  };
}

async function readLocalJson(pathname) {
  try {
    const content = await fs.readFile(localPath(pathname), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function listLocalJson(prefix) {
  const directory = localPath(prefix);

  try {
    const files = await fs.readdir(directory, {
      withFileTypes: true
    });
    const jsonFiles = files.filter((file) => file.isFile() && file.name.endsWith(".json"));

    return Promise.all(
      jsonFiles.map(async (file) => {
        return readLocalJson(`${prefix}${file.name}`);
      })
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function putJson(pathname, payload) {
  ensureBlobConfigured();

  if (isLocalStorageEnabled()) {
    return putLocalJson(pathname, payload);
  }

  return put(pathname, JSON.stringify(payload, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
}

async function findBlobByPath(pathname) {
  ensureBlobConfigured();

  if (isLocalStorageEnabled()) {
    const json = await readLocalJson(pathname);

    if (!json) {
      return null;
    }

    return {
      pathname,
      url: `local://${pathname}`
    };
  }

  const result = await list({
    prefix: pathname,
    limit: 1,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return result.blobs.find((item) => item.pathname === pathname) || null;
}

async function readJsonByPath(pathname) {
  if (isLocalStorageEnabled()) {
    return readLocalJson(pathname);
  }

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

  if (isLocalStorageEnabled()) {
    const codes = await listLocalJson("codes/");

    return codes
      .filter(Boolean)
      .sort((a, b) => a.code.localeCompare(b.code, "pt-BR"));
  }

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

  if (isLocalStorageEnabled()) {
    const registrations = await listLocalJson("registrations/");

    return registrations.filter(Boolean).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

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

  if (isLocalStorageEnabled()) {
    const base64 = buffer.toString("base64");

    return {
      pathname: `inline:${crypto.randomUUID()}`,
      url: `data:${contentType};base64,${base64}`,
      contentType
    };
  }

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
