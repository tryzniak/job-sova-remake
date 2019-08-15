const R = require("ramda");
const joi = require("@hapi/joi");

module.exports = function(ResumeService) {
  return async (id, fields) => {
    const validFields = await validate(fields);
    await ResumeService.update(id, validFields);
    return await ResumeService.findByID(id);
  };
};

async function validate(data) {
  try {
    return await schema.validateAsync(data, { stripUnknown: true });
  } catch (e) {
    e.code = "ER_BAD_ARGUMENTS";
    throw e;
  }
}

const schema = joi
  .object({
    title: joi.string(),
    about: joi.string().max(600),
    professions: joi.array().items(joi.string()),
    educations: joi.array().items(
      joi.object({
        institutionTitle: joi.string().required(),
        endingOn: joi.date().required(),
        specialty: joi.string().required(),
        educationId: joi
          .number()
          .positive()
          .integer()
          .required()
      })
    ),
    experiences: joi.array().items(
      joi.object({
        positionTitle: joi.string().required(),
        employerTitle: joi.string().required(),
        endingOn: joi
          .date()
          .required()
          .default(new Date(2100, 1, 1)),
        startingOn: joi.date().required()
      })
    ),
    skills: joi.array().items(joi.string()),
    disabilityTypeId: joi
      .number()
      .positive()
      .integer(),
    disabilityGroupId: joi
      .number()
      .positive()
      .integer(),
    isActive: joi.bool(),
    isRemoteOnly: joi.bool(),
    hasExperience: joi.bool(),
    residence: joi.string(),
    needsAccessibility: joi.bool()
  })
  .min(1);
