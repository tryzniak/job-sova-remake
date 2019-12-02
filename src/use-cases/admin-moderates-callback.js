const R = require("ramda");
const joi = require("@hapi/joi");
const ModerationStatus = require("../moderation-status");

module.exports = function(CallbackService, sendCallbackToPartner, broadcast) {
  return async (currentUser, id, fields) => {
    if (currentUser.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const validFields = await validate(fields);
    await CallbackService.update(id, validFields);

    if (validFields.moderationStatus === ModerationStatus.OK) {
      const callbackDetails = await CallbackService.findByID(id);
      sendCallbackToPartner(callbackDetails.partnerEmail, {
        message: callbackDetails.message,
        phone: callbackDetails.phone
      });
      broadcast({
        resource: "callbacks",
        privateEvent: { userId: callbackDetails.jobSeekerId },
        payload: {
          callbackId: id,
          moderationStatus: validFields.moderationStatus
        }
      });
    }
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
    moderationStatus: joi
      .string()
      .allow(...Object.values(ModerationStatus))
      .required()
  })
  .required();
