const joi = require("@hapi/joi");
const ModerationStatus = require("../moderation-status");

module.exports = function(QuestionService, sendQuestionToPartner) {
  return async (user, id, fields) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const validFields = await validate(fields);
    await QuestionService.update(id, validFields);
    if (validFields.moderationStatus === ModerationStatus.OK) {
      const questionDetails = await QuestionService.findByID(id);
      sendQuestionToPartner(questionDetails.partnerEmail, {
        message: questionDetails.message,
        userEmail: questionDetails.email
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
