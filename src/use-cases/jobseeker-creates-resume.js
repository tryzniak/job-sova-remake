const yup = require("yup");
const R = require("ramda");
const { subYears } = require("date-fns");
const phone = require("phone");

module.exports = function(ResumeService, sendEmail) {
  return async (user, data) => {
    if (user.role !== "jobseeker") {
      throw new Error("Unauthorized");
    }
    const validData = await validate(data);
    const id = await ResumeService.create(validData);
    sendEmail(`/resumes/${id}`)
    return id
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  patronymicName: yup.string().required(),
  dateOfBirth: yup
    .date()
    .max(subYears(new Date(), 18))
    .required(),
  jobSeekerId: yup
    .number()
    .integer()
    .required(),
  title: yup
    .string()
    .transform(capitalize)
    .required(),
  email: yup
    .string()
    .email()
    .required(),
  phone: yup
    .string()
    .transform(value => phone(value, "BLR")[0])
    .test(
      "is-phone",
      "${path} should confirm to +375331234567 format",
      value => value !== undefined
    )
    .required(),
  communicationMeans: yup
    .string()
    .oneOf(["phone", "email"])
    .required(),
  about: yup
    .string()
    .transform(capitalize)
    .max(600)
    .required(),
  citizenshipId: yup
    .number()
    .integer()
    .required(),
  // TODO better field type / relationship maybe
  residence: yup
    .string()
    .max(256)
    .required(),
  skills: yup
    .array()
    .of(yup.string())
    .max(10)
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
    e.code = "ER_VALIDATE"
    throw e;
  }
}
