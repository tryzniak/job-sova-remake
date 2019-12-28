const R = require("ramda");
const ModerationStatus = require("../moderation-status");
const joi = require("@hapi/joi").extend(require("@hapi/joi-date"));
const { subYears } = require("date-fns");

module.exports = function(ResumeService, sendEmail) {
  return async (user, id, fields) => {
    if (user.role !== "jobseeker") {
      throw new Error("Unauthorized");
    }

    const validFields = await validate(fields);
    await ResumeService.updateForJobSeeker(user.id, id, {
      ...validFields,
      moderationStatus: ModerationStatus.NEEDS_REVIEW
    });
    sendEmail(`/resumes/${id}`);
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
    skills: joi
      .array()
      .items(joi.string())
      .max(10),
    disabilityTypeId: joi
      .number()
      .positive()
      .integer(),
    disabilityGroupId: joi
      .number()
      .positive()
      .integer(),
    citizenshipId: joi
      .number()
      .positive()
      .integer(),
    communicationMeans: joi.string().allow("phone", "email"),
    firstName: joi.string(),
    lastName: joi.string(),
    patronymicName: joi.string(),
    dateOfBirth: joi
      .date()
      .format(["YYYY-MM-DD"])
      .max(subYears(new Date(), 18)),
    isActive: joi.bool(),
    isRemoteOnly: joi.bool(),
    hasExperience: joi.bool(),
    residence: joi.string(),
    needsAccessibility: joi.bool(),
    location: joi.object({
      lat: joi.string().required(),
      lng: joi.string().required(),
      address: joi.string().required()
    })
  })
  .min(1);
