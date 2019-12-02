const ModerationStatus = require("../moderation-status");
const yup = require("yup");

module.exports = function(SpecialtiesService) {
  return async (user, moderationStatus) => {
    if (user.role === "admin") {
      return await SpecialtiesService.all(await validate(moderationStatus));
    }

    return await SpecialtiesService.all(ModerationStatus.OK);
  };
};

const schema = yup
  .string()
  .oneOf(Object.values(ModerationStatus))
  .required();

async function validate(data) {
  try {
    return await schema.validate(data, {
      stripUnknown: true
    });
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}
