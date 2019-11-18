const joi = require("@hapi/joi");

module.exports = function(PartnerService) {
  return async (id, fields) => {
    const validFields = await validate(fields);
    await PartnerService.create(validFields);
    return await PartnerService.findByID(id);
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
    email: joi
      .string()
      .email()
      .required(),
    title: joi.string().required(),
    about: joi.string().required()
  })
  .required();
