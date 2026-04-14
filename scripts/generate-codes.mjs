const prefix = process.argv[2] || "EJC-2026";
const total = Number(process.argv[3] || 20);

const generated = Array.from({ length: total }, (_, index) => {
  const number = String(index + 1).padStart(3, "0");
  return {
    code: `${prefix}-${number}`,
    holder: `Participante ${number}`,
    group: "Convidados"
  };
});

console.log(JSON.stringify(generated, null, 2));
