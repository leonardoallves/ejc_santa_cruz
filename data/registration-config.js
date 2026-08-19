const registrationConfig = {
  pageTitle: "Inscricao EJC",
  pageEyebrow: "EJC 2026",
  pageHeading: "Informe seu codigo para liberar a inscricao",
  pageDescription:
    "Digite o codigo recebido do administrador. Depois da validacao, o formulario sera liberado para concluir sua inscricao.",
  codeLabel: "Codigo de inscricao",
  codePlaceholder: "Ex.: AB1234",
  codeButtonLabel: "Continuar",
  codeMaxLength: 8,
  allowedCodePattern: /^[A-Z0-9]{1,8}$/,
  photoFieldName: "photo",
  photoMaxBytes: 5 * 1024 * 1024,
  allowedPhotoTypes: ["image/jpeg", "image/png", "image/webp"],
  successMessage: "Inscricao concluida com sucesso.",
  invalidCodeMessage: "Codigo invalido ou indisponivel.",
  adminPasswordLabel: "Senha administrativa",
  fields: [
    {
      name: "name",
      label: "Nome completo",
      type: "text",
      required: true,
      maxLength: 120
    },
    {
      name: "phone",
      label: "Telefone",
      type: "tel",
      required: true,
      maxLength: 20
    },
    {
      name: "email",
      label: "E-mail",
      type: "email",
      required: true,
      maxLength: 120
    },
    {
      name: "city",
      label: "Cidade",
      type: "text",
      required: false,
      maxLength: 80
    },
    {
      name: "birthDate",
      label: "Data de nascimento",
      type: "date",
      required: false
    },
    {
      name: "notes",
      label: "Observacoes",
      type: "textarea",
      required: false,
      rows: 4,
      maxLength: 500,
      placeholder: "Se precisar, informe algum detalhe importante."
    },
    {
      name: "photo",
      label: "Foto",
      type: "file",
      required: true,
      accept: "image/jpeg,image/png,image/webp"
    }
  ]
};

module.exports = {
  registrationConfig
};
