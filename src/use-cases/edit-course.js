const R = require("ramda");
const joi = require("@hapi/joi");
const ModerationStatus = require("../moderation-status");

module.exports = function(CourseService) {
  return async (user, id, fields) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const validFields = await validate(fields);
    await CourseService.update(id, validFields);
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
    about: joi.string().max(600)
  })
  .min(1);
