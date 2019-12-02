const yup = require("yup");
const R = require("ramda");

module.exports = function(VacancyService, sendMail) {
  return async (currentUser, data) => {
    if (currentUser.role !== "employer") {
      throw new Error("Unauthorized");
    }

    const validData = await validate(data);
    const id = await VacancyService.create(validData);
    sendMail(`/vacancies/${id}`)
    return id
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  employerId: yup
    .number()
    .integer()
    .required(),
  educationId: yup
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
  skills: yup
    .array()
    .of(yup.string())
    .max(10)
    .required(),
  isActive: yup
    .bool()
    .default(true)
    .required(),
  isRemoteOk: yup
    .bool()
    .default(true)
    .required(),
  isAccessible: yup
    .bool()
    .default(true)
    .required(),
  location: yup
    .object()
    .shape({
      lat: yup.number().required(),
      lng: yup.number().required(),
      address: yup.string().required()
    })
    .required(),
  experienceIsRequired: yup.boolean().default(false),
  hasTrainingOrCourse: yup.boolean().default(false),
  partTime: yup
    .boolean()
    .default(false)
    .required(),
  contacts: yup
    .string()
    .min(1)
    .max(600)
    .required(),
  responsibilities: yup
    .string()
    .min(1)
    .max(600)
    .required(),
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
