const yup = require("yup");
const R = require("ramda");
const { subYears } = require("date-fns");
const phone = require("phone");

module.exports = function(JobseekerService) {
  return async data => {
    const validData = await validate(data);
    return await JobseekerService.create(validData);
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  firstName: yup
    .string()
    .transform(capitalize)
    .required(),
  lastName: yup
    .string()
    .transform(capitalize)
    .required(),
  patronymicName: yup
    .string()
    .transform(capitalize)
    .required(),
  username: yup.string().required(),
  password: yup
    .string()
    .min(8)
    .max(256)
    .required(),
  gender: yup.string().oneOf(["m", "f"]),
  phone: yup
    .string()
    .transform(value => phone(value, "BLR")[0])
    .test(
      "is-phone",
      "${path} should confirm to +375331234567 format",
      value => value !== undefined
    )
    .required(),
  email: yup
    .string()
    .email()
    .required(),
  dateOfBirth: yup
    .date()
    .max(subYears(new Date(), 18))
    .required(),
  contacts: yup
    .string()
    .max(600)
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
