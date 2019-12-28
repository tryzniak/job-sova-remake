const R = require("ramda");
const yup = require("yup");
const ModerationStatus = require("../moderation-status");

module.exports = function(VacancyService) {
  return async (user, id, fields) => {
    if (user.role !== "employer") {
      throw new Error("Unauthorized");
    }

    const validFields = await validate(fields);
    await VacancyService.updateForEmployer(user.id, id, {
      ...validFields,
      moderationStatus: ModerationStatus.NEEDS_REVIEW
    });
  };
};

async function validate(data) {
  try {
    const result = await schema.validateAsync(data, { stripUnknown: true });
    if (R.isEmpty(result)) {
      throw new Error("No fields to update");
    }
    return result;
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}

const schema = yup.object().shape({
  educationId: yup.number().integer(),
  title: yup.string(),
  about: yup.string().max(600),
  skills: yup
    .array()
    .of(yup.string())
    .max(10),
  isActive: yup.bool().default(true),
  isRemoteOk: yup.bool().default(true),
  isAccessible: yup.bool().default(true),
  location: yup
    .object()
    .shape({
      lat: yup.number().required(),
      lng: yup.number().required(),
      address: yup.string().required()
    })
    .nullable()
    .default(null),
  experienceIsRequired: yup.boolean().default(false),
  hasTrainingOrCourse: yup.boolean().default(false),
  partTime: yup.boolean().default(false),
  contacts: yup
    .string()
    .min(1)
    .max(600),
  responsibilities: yup
    .string()
    .min(1)
    .max(600),
  salaryBYR: yup
    .number()
    .integer()
    .positive(),
  disabilityGroupId: yup
    .number()
    .integer()
    .positive(),
  disabilityTypeId: yup
    .number()
    .integer()
    .positive()
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
