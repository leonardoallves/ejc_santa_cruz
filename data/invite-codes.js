const inviteCodes = [
  { code: "EJC-2026-001", holder: "Ana Souza", group: "Casais" },
  { code: "EJC-2026-002", holder: "Bruno Lima", group: "Casais" },
  { code: "EJC-2026-003", holder: "Carla Mendes", group: "Juventude" },
  { code: "EJC-2026-004", holder: "Daniel Rocha", group: "Juventude" },
  { code: "EJC-2026-005", holder: "Eduarda Silva", group: "Servos" },
  { code: "EJC-2026-006", holder: "Felipe Costa", group: "Servos" },
  { code: "EJC-2026-007", holder: "Gabriela Santos", group: "Casais" },
  { code: "EJC-2026-008", holder: "Henrique Alves", group: "Juventude" },
  { code: "EJC-2026-009", holder: "Isabela Nunes", group: "Servos" },
  { code: "EJC-2026-010", holder: "Joao Pedro", group: "Convidados" }
];

function findInviteByCode(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  return inviteCodes.find((invite) => invite.code === normalizedCode) || null;
}

module.exports = {
  inviteCodes,
  findInviteByCode
};
