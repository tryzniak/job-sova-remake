const yup = require("yup");
const R = require("ramda");

module.exports = function(ResumeService) {
  return async filter => {
    return await ResumeService.all(
      await validate({ isActive: true, ...filter })
    );
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  educations: yup.array().of(yup.number().integer()),
  title: yup.string().transform(capitalize),
  disabilityId: yup.number().integer(),
  professions: yup.array().of(yup.string()),
  skills: yup.array().of(yup.string()),
  isActive: yup.bool(),
  hasExperience: yup.bool(),
  needsAccessibility: yup.bool(),
  isRemoteOnly: yup.bool(),
  jobSeekerId: yup.number().integer(),
  pagination: yup
    .object()
    .shape({
      pageNumber: yup
        .number()
        .min(0)
        .required(),
      perPage: yup
        .number()
        .min(1)
        .required()
    })
    .nullable()
    .default(null)
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
