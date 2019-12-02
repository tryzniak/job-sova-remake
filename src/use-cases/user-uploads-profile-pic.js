const joi = require("@hapi/joi");

module.exports = function(UserService, processImage) {
  return async (user, userId, file) => {
    if (user.id != userId) {
      throw new Error("Unauthorized");
    }
    const imageId = await processImage(file);
    await UserService.update(await validate(userId), {
      profilePicId: imageId
    });

    return imageId;
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
  .number()
  .positive()
  .required();
