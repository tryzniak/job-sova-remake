const joi = require("@hapi/joi");

module.exports = function(PartnerService) {
  return async (user, id, fields) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const validFields = await validate(fields);
    await PartnerService.update(id, validFields);
  };
};

async function validate(data) {
  try {
    return await schema.validateAsync(data, { stripUnknown: true });
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}

const schema = joi
  .object({
    title: joi.string().max(256),
    email: joi.string().email(),
    about: joi.string().max(600)
  })
  .min(1);
