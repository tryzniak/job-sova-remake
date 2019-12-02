const yup = require("yup");
module.exports = function(ApplicationService) {
  return async (user, data) => {
    if (user.role !== "jobseeker") {
      throw new Error("Only jobseekers can do it");
    }
    const validData = await validate(data);
    if (user.id !== validData.jobSeekerId) {
      throw new Error("Unauthorized");
    }
    return await ApplicationService.createWithoutResume(user, validData);
  };
};

const schema = yup.object().shape({
  jobSeekerId: yup
    .number()
    .integer()
    .required(),
  vacancyId: yup
    .number()
    .integer()
    .required(),
  jobSeekerContacts: yup
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
