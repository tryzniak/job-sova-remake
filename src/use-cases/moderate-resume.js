const yup = require("yup");
const R = require("ramda");
const ModerationStatus = require("../moderation-status");

const moderateVacancy = ResumeService => async (
  user,
  id,
  { moderationStatus }
) => {
  if (user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const validFields = await validate({ id, moderationStatus });
  if (R.isEmpty(validFields)) {
    const e = new Error("Payload is empty");
    e.code = "ER_VALIDATE";
    throw e;
  }
  await ResumeService.update(id, validFields);
};

async function validate(fields) {
  try {
    return await schema.validate(fields, { stripUnknown: true });
  } catch (validationError) {
    validationError.code = "ER_VALIDATE";
    throw validationError;
  }
}

const schema = yup.object().shape({
  id: yup
    .number()
    .integer()
    .required(),
  moderationStatus: yup
    .string()
    .oneOf(Object.values(ModerationStatus))
    .required()
});

module.exports = moderateVacancy;
