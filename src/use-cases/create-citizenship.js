const yup = require("yup");
const R = require("ramda");

module.exports = function(CitizenshipService) {
  return async (user, data) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const validData = await validate(data);
    return await CitizenshipService.create(validData);
  };
};

const schema = yup.object().shape({
  title: yup
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
