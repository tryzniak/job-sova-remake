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
    return await schema.validate(data, {
      stripUnknown: true
    });
  } catch (e) {
    e.code = "BAD_ARGS";
    throw e;
  }
}

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  moderationStatus: yup
    .string()
    .oneOf([ModerationStatus.OK])
    .required(),
  employerId: yup.number().integer(),
  educationId: yup.number().integer(),
  title: yup.string().transform(capitalize),
  disabilityId: yup.number().integer(),
  profession: yup.string(),
  skills: yup.array().of(yup.string()),
  occupations: yup.array().of(yup.number().integer()),
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
  pagination: yup
    .object()
    .shape({
      perPage: yup
        .number()
        .positive()
        .required()
        .default(1),
      pageNumber: yup
        .number()
        .min(0)
        .required()
        .default(0)
    })
    .required()
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
