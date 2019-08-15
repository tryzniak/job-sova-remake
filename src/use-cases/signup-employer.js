const yup = require("yup");
const R = require("ramda");

module.exports = function(EmployerService) {
  return async data => {
    const validData = await validate(data);
    return await EmployerService.create(validData);
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  title: yup
    .string()
    .transform(capitalize)
    .required(),
  about: yup
    .string()
    .transform(capitalize)
    .required(),
  phone: yup
    .string()
    .transform(capitalize)
    .required(),
  username: yup.string().required(),
  password: yup
    .string()
    .min(8)
    .max(256)
    .required(),
  phone: yup.string().required(),
  email: yup
    .string()
    .email()
    .required(),
  residence: yup
    .string()
    .max(256)
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
