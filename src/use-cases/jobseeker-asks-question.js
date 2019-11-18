const R = require("ramda");
const joi = require("@hapi/joi");

module.exports = function(QuestionService) {
  return async (jobSeekerId, partnerId, fields) => {
    const validFields = await validate({ partnerId, jobSeekerId, ...fields });
    const id = await QuestionService.create(validFields);
    return await QuestionService.findByID(id);
  };
};

async function validate(data) {
  try {
    if (result.length !== 2) {
      throw new Error("Bad phone number");
    }
    return await schema.validateAsync(
      { ...data, phone: result[0] },
      { stripUnknown: true }
    );
  } catch (e) {
    e.code = "ER_BAD_ARGUMENTS";
    throw e;
  }
}

const schema = joi
  .object({
    message: joi.string().required(),
    email: joi
      .string()
      .email()
      .required(),
    partnerId: joi
      .number()
      .integer()
      .positive()
      .required(),
    jobSeekerId: joi
      .number()
      .integer()
      .positive()
      .required()
  })
  .required();
