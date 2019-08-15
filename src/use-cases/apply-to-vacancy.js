const yup = require("yup");
module.exports = function(ApplicationService) {
  return async data => {
    const validData = await validate(data);
    return await ApplicationService.create(validData);
  };
};

const schema = yup.object().shape({
  jobSeekerId: yup
    .number()
    .integer()
    .required(),
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
