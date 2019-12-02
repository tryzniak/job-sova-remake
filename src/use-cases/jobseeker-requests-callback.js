const R = require("ramda");
const joi = require("@hapi/joi");
const phone = require("phone");

module.exports = function(CallbackService, sendEmail) {
  return async (currentUser, jobSeekerId, partnerId, fields) => {
    if (currentUser.role !== "jobseeker" && currentUser.id !== jobSeekerId) {
      throw new Error("Unauthorized");
    }
    const validFields = await validate({ partnerId, jobSeekerId, ...fields });
    const id = await CallbackService.create(validFields);
    sendEmail(`/callbacks/${id}`)
    return id
  };
};

async function validate(data) {
  try {
    const result = phone(data.phone, "BLR", true);
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
    phone: joi.string().required(),
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
