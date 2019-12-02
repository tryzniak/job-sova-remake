const R = require("ramda");
const joi = require("@hapi/joi");

module.exports = function(EmployerService) {
  return async (user, id, fields) => {
    if (user.role !== "employer" && user.id !== id) {
      throw new Error("Unauthorized");
    }
    const validFields = await validate(fields);
    await EmployerService.update(id, validFields);
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

const schema = joi
  .object({
    title: joi.string(),
    about: joi.string().max(600),
    residence: joi.string()
  })
  .min(1);
