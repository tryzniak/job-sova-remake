const yup = require("yup");
const R = require("ramda");

module.exports = function(CourseService) {
  return async (user, data) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const validData = await validate(data);
    return await CourseService.create(validData);
  };
};

const capitalize = R.replace(/^./, R.toUpper);
const schema = yup.object().shape({
  title: yup
    .string()
    .max(256)
    .required(),
  about: yup
    .string()
    .transform(capitalize)
    .max(600)
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
