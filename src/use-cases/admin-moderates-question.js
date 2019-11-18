const joi = require("@hapi/joi");
const ModerationStatus = require("../moderation-status");

module.exports = function(QuestionService, sendQuestionToPartner) {
  return async (id, fields) => {
    const validFields = await validate(fields);
    await QuestionService.update(id, validFields);
    if (validFields.moderationStatus === ModerationStatus.OK) {
      await sendQuestionToPartner(id);
    }
    return await QuestionService.findByID(id);
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
