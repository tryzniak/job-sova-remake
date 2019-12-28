const ModerationStatus = require("../moderation-status");
const yup = require("yup");
const R = require("ramda");

module.exports = function(VacancyService) {
  return async (user, filters) => {
    if (user.role === "jobseeker") {
      return await VacancyService.all(
        R.filter(
          R.compose(
            R.not,
            R.isNil
          ),
          await validate({ ...filters, moderationStatus: ModerationStatus.OK })
        )
      );
    }

    if (user.role === "admin") {
      return await VacancyService.all(
        R.filter(
          R.compose(
            R.not,
            R.isNil
          ),
          await validate({ ...filters })
        )
      );
    }

    throw new Error("Unauthorized");
  };
};

async function validate(data) {
  try {
    const result = await schema.validate(data, {
      stripUnknown: true
    });
    if (Object.keys(result).length === 0) {
      const e = new Error("Cannot update. Provide at least 1 key value pair");
      e.code = "ER_VALIDATE";
      throw e;
    }
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}

const schema = yup.object().shape({
  moderationStatus: yup
    .string()
    .oneOf(Object.values(ModerationStatus))
    .required(),
  employerId: yup.number().integer(),
  educationId: yup.number().integer(),
  title: yup.string(),
  disabilityTypeId: yup.number().integer(),
  disabilityGroupId: yup.number().integer(),
  skills: yup.array().of(yup.string()),
  partTime: yup.bool(),
  isActive: yup.bool(),
  isRemoteOk: yup.bool(),
  isAccessible: yup.bool(),
  nearby: yup
    .object()
    .shape({
      lat: yup.number().required(),
      lng: yup.number().required(),
      radius: yup
        .number()
        .integer()
        .positive()
        .required()
    })
    .default(null)
    .nullable(),
  minSalary: yup.number().integer(),
  maxSalary: yup
    .number()
    .integer()
    .min(yup.ref("minSalary")),
  hasTrainingOrCourse: yup.boolean(),
  experienceIsRequired: yup.boolean(),
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
