const R = require("ramda");
const joi = require("@hapi/joi");

module.exports = function(UserService, passwordHasher) {
  return async (token, fields) => {
    const validFields = await validate(fields);
    return await UserService.resetPassword(
      token,
      await passwordHasher(validFields.newPassword)
    );
  };
};

async function validate(data) {
  try {
    return await schema.validateAsync(data, { stripUnknown: true });
  } catch (e) {
    e.code = "ER_BAD_ARGUMENTS";
    throw e;
  }
}

const schema = joi.object({
  newPassword: joi
    .string()
    .min(8)
    .max(256)
    .required()
});
