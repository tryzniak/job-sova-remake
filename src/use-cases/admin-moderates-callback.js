const R = require("ramda");
const joi = require("@hapi/joi");
const phone = require("phone");
const ModerationStatus = require("../moderation-status");

module.exports = function(CallbackService, sendCallbackToPartner) {
  return async (id, fields) => {
    const validFields = await validate(fields);
    await CallbackService.update(id, validFields);
    if (validFields.moderationStatus === ModerationStatus.OK) {
      await sendCallbackToPartner(id);
    }
    return await CallbackService.findByID(id);
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
    moderationStatus: joi.string().allow(...Object.values(ModerationStatus))
  })
  .required();
