const yup = require("yup");
module.exports = function(ApplicationService) {
  return async (user, data) => {
    if (!["employer", "jobseeker"].includes(user.role)) {
      throw new Error("Unauthorized");
    }

    const validData = await validate(data);
    return await ApplicationService.createWithResume(user, validData);
  };
};

const schema = yup.object().shape({
  resumeId: yup
    .number()
    .integer()
    .required(),
  vacancyId: yup
    .number()
    .integer()
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
