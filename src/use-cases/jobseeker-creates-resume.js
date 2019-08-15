const yup = require("yup");
const R = require("ramda");
const datefns = require("date-fns");

module.exports = function(ResumeService) {
  return async data => {
    const validData = await validate(data);
    return await ResumeService.create(validData);
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  jobSeekerId: yup
    .number()
    .integer()
    .required(),
  title: yup
    .string()
    .transform(capitalize)
    .required(),
  about: yup
    .string()
    .transform(capitalize)
    .max(600)
    .required(),
  // TODO validate
  disabilityId: yup
    .number()
    .integer()
    .required(),
  // TODO better field type / relationship maybe
  residence: yup
    .string()
    .max(256)
    .required(),
  professions: yup
    .array()
    .of(yup.string())
    .required(),
  skills: yup
    .array()
    .of(yup.string())
    .required(),
  educations: yup.array().of(yup.number().integer()),
  hasExperience: yup
    .bool()
    .default(true)
    .required(),
  isActive: yup
    .bool()
    .default(true)
    .required(),
  isRemoteOnly: yup
    .bool()
    .default(true)
    .required(),
  needsAccessibility: yup
    .bool()
    .default(true)
    .required(),
  experiences: yup.array(
    yup
      .object()
      .shape({
        positionTitle: yup.string().required(),
        startingOn: yup.date().required(),
        endingOn: yup
          .date()
          .default(new Date(2100, 1, 1))
          .required()
      })
      .nullable()
      .default(null)
  ),
  educations: yup.array(
    yup
      .object()
      .shape({
        institutionTitle: yup.string().required(),
        specialty: yup.string().required(),
        educationId: yup
          .number()
          .positive()
          .integer()
          .required(),
        endingOn: yup.date().required()
      })
      .nullable()
      .default(null)
  ),
  disabilityTypeId: yup
    .number()
    .positive()
    .integer()
    .required(),
  disabilityGroupId: yup
    .number()
    .positive()
    .integer()
    .required()
});

async function validate(data) {
  try {
    return await schema.validate(data, {
      stripUnknown: true
    });
  } catch (e) {
    e.code = "ER_SIGNUP_VALIDATE";
    throw e;
  }
}
