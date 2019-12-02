const yup = require("yup");

module.exports = function(PartnerService) {
  return async (user, data) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const validData = await validate(data);
    return await PartnerService.create(validData);
  };
};

const schema = yup.object().shape({
  title: yup.string().required(),
  about: yup
    .string()
    .max(600)
    .required(),
  email: yup
    .string()
    .email()
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
