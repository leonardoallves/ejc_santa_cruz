const { registrationConfig } = require("../data/registration-config");

function getPublicRegistrationConfig() {
  return {
    pageTitle: registrationConfig.pageTitle,
    pageEyebrow: registrationConfig.pageEyebrow,
    pageHeading: registrationConfig.pageHeading,
    pageDescription: registrationConfig.pageDescription,
    codeLabel: registrationConfig.codeLabel,
    codePlaceholder: registrationConfig.codePlaceholder,
    codeButtonLabel: registrationConfig.codeButtonLabel,
    codeMaxLength: registrationConfig.codeMaxLength,
    allowedPhotoTypes: registrationConfig.allowedPhotoTypes,
    photoMaxBytes: registrationConfig.photoMaxBytes,
    successMessage: registrationConfig.successMessage,
    invalidCodeMessage: registrationConfig.invalidCodeMessage,
    fields: registrationConfig.fields
  };
}

module.exports = {
  registrationConfig,
  getPublicRegistrationConfig
};
