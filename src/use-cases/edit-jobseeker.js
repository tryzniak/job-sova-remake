const R = require("ramda");
const joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
const { subYears } = require("date-fns");

module.exports = function(JobseekerService) {
  return async (user, id, fields) => {
    if (user.role !== "jobseeker" || user.id != id) {
      throw new Error("Unauthorized");
    }
    const validFields = await validate(fields);
    await JobseekerService.update(id, validFields);
  };
};

async function validate(data) {
  const schema = joi
    .object({
      firstName: joi.string(),
      lastName: joi.string(),
      patronymicName: joi.string(),
      gender: joi
        .string()
        .valid("m", "f")
        .allow(null),
      dateOfBirth: joi
        .date()
        .format(["YYYY-MM-DD"])
        .max(subYears(new Date(), 18))
    })
    .min(1);
  try {
    return await schema.validateAsync(data, { stripUnknown: true });
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}
