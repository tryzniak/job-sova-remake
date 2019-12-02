const ModerationStatus = require("../moderation-status");
const yup = require("yup");

module.exports = function(SpecialtiesService) {
  return async (user, id, moderationStatus) => {
    if (user.role === "admin") {
      return await SpecialtiesService.findByID(
        id,
        await validate(moderationStatus)
      );
    }

    return await SpecialtiesService.findByID(id, ModerationStatus.OK);
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
