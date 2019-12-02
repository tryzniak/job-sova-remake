const R = require("ramda");
const joi = require("@hapi/joi");

module.exports = function(QuestionService, sendMail) {
  return async (user, jobSeekerId, partnerId, fields) => {
    if (user.role !== "jobseeker" || user.id !== jobSeekerId) {
      throw new Error("Unauthorized");
    }
    const validFields = await validate({ partnerId, jobSeekerId, ...fields });
    const id = await QuestionService.create(validFields);
    sendMail(`/questions/${id}`)
    return id;
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
