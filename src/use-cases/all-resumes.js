const yup = require("yup");
const R = require("ramda");
const ModerationStatus = require("../moderation-status");

module.exports = function(ResumeService) {
  return async (user, filter) => {
    if (user.role === "admin") {
      return await ResumeService.all(await validate(filter));
    }

    if (user.role === "employer") {
      return await ResumeService.all(
        await validate({
          ...filter,
          isActive: true,
          moderationStatus: ModerationStatus.OK
        })
      );
    }

    throw new Error("Cannot process");
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  educations: yup.array().of(yup.number().integer()),
  title: yup.string().transform(capitalize),
  skills: yup.array().of(yup.number().integer()),
  isActive: yup.bool(),
  hasExperience: yup.bool(),
  needsAccessibility: yup.bool(),
  isRemoteOnly: yup.bool(),
  citizenshipId: yup.number().integer(),
  jobSeekerId: yup.number().integer(),
  disabilityTypeId: yup.number().integer(),
  disabilityGroupId: yup.number().integer(),
  specialties: yup.array().of(yup.string()),
  moderationStatus: yup
    .string()
    .oneOf(Object.values(ModerationStatus))
    .default(ModerationStatus.OK),
  paginationState: yup.number().integer()
});

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
