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
    const e = new Error("Could not edit");
    e.code = "ER_EDIT_EMPTY";
    throw e;
  }
  const affectedRows = await ResumeService.update(id, validFields);
  if (affectedRows === 0) {
    const e = new Error("Could not edit");
    e.code = "ER_NOT_FOUND";
    throw e;
  }
};

async function validate(fields) {
  try {
    return await schema.validate(fields, { stripUnknown: true });
  } catch (validationError) {
    validationError.code = "ER_VALIDATION";
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
