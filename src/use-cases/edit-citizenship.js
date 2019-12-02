const R = require("ramda");
const yup = require("yup");

module.exports = function(CitizenshipService) {
  return async (user, id, fields) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const validFields = await validate(fields);
    await CitizenshipService.update(id, validFields);
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
