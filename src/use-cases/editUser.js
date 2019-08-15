const yup = require("yup");
const R = require("ramda");

async function editUser(UserService, id, fields) {
  const validFields = await validate(fields);
  if (R.isEmpty(validFields)) {
    const e = new Error("Could not edit a user");
    e.code = "ER_EDIT_USER";
    throw e;
  }
  const affectedRows = await UserService.update(id, validFields);
  if (affectedRows === 0) {
    const e = new Error("Could not edit a user");
    e.code = "ER_NOT_FOUND";
    throw e;
  }

  return UserService.findByID(id);
}

const capitalize = R.replace(/^./, R.toUpper);
async function validate(fields) {
  try {
    return await userUpdateSchema.validate(fields, { stripUnknown: true });
  } catch (validationError) {
    validationError.code = "ER_VALIDATION";
    throw validationError;
  }
}

const userUpdateSchema = yup.object().shape({
  email: yup.string().email(),
  phoneNumber: yup.string(),
  firstName: yup
    .string()
    .min(1)
    .max(255)
    .trim()
    .transform(capitalize),
  lastName: yup
    .string()
    .min(1)
    .max(255)
    .trim()
    .transform(capitalize),
  patronymic: yup
    .string()
    .min(1)
    .max(255)
    .trim()
    .transform(capitalize)
});
module.exports = editUser;
