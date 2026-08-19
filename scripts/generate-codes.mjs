const prefix = (process.argv[2] || "EJC26")
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, "")
  .slice(0, 4);
const total = Number(process.argv[3] || 20);
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(length) {
  let result = "";

  while (result.length < length) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
}

const generatedCodes = new Set();

while (generatedCodes.size < total) {
  const suffixLength = Math.max(1, 8 - prefix.length);
  generatedCodes.add(`${prefix}${randomSuffix(suffixLength)}`.slice(0, 8));
}

const generated = Array.from(generatedCodes, (code) => ({ code }));

console.log(JSON.stringify(generated, null, 2));
