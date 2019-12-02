const joi = require("@hapi/joi");
const R = require("ramda");

module.exports = function(ApplicationService) {
  return async (userId, applicationId) => {
    return await ApplicationService.messages(
      await validate(userId),
      await validate(applicationId)
    );
  };
};

const schema = joi
  .number()
  .integer()
  .positive()
  .required();

async function validate(data) {
  try {
    return await schema.validateAsync(data, {
      stripUnknown: true
    });
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}
