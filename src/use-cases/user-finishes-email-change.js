const joi = require("@hapi/joi");
const datefns = require("date-fns");

module.exports = function(UserService) {
  return async token => {
    const validToken = await validate(token);
    await UserService.changeEmail(validToken);
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

const schema = joi.string().required();
