const yup = require("yup");
const R = require("ramda");
const { hash } = require("argon2");

module.exports = function(
  EmployerService,
  generateUpdatesToken,
  changeEmailUseCase
) {
  return async data => {
    const validData = await validate(data);
    const id = await EmployerService.create(
      hash,
      generateUpdatesToken,
      validData
    );

    await changeEmailUseCase(validData.email, validData.email);

    return id;
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
    e.code = "ER_VALIDATE";
    throw e;
  }
}
