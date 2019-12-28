const joi = require("@hapi/joi");
const datefns = require("date-fns");
const { unauthorized } = require("../errors");

module.exports = function(
  UserService,
  sendVerificationUrl,
  generateToken,
  generateCallbackUrl
) {
  return async (email, newEmail) => {
    const token = await generateToken();
    await UserService.requestEmailChange(
      await validate(email),
      await validate(newEmail),
      token
    );
    sendVerificationUrl(email, await generateCallbackUrl(token));
  };
};

async function validate(data) {
  try {
    return await schemaEmail.validateAsync(data, { stripUnknown: true });
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}

const schemaEmail = joi
  .string()
  .email()
  .required();
