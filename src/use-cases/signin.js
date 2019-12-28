const R = require("ramda");
const { invalidSignin } = require("../errors");
const yup = require("yup");

module.exports = (UserService, verifyPassword) => async (email, password) => {
  const { validEmail, validPasword } = await yup
    .object()
    .shape({
      email: yup
        .string()
        .email()
        .required(),
      password: yup
        .string()
        .min(8)
        .max(256)
        .required()
    })
    .validate({ email, password }, { stripUnknown: true });
  const user = await UserService.findByEmail(email);
  const match = await verifyPassword(user.passwordHash, password);
  if (!match) {
    throw invalidSignin;
  }
  return R.omit(["passwordHash"], user);
};
