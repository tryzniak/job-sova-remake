const joi = require("@hapi/joi");

module.exports = function(UserService, processImage) {
  return async (user, id, file) => {
    if (user.id != id) {
      throw new Error("Unauthorized");
    }
    const imageId = await processImage(file);
    await UserService.update(await validate(id), {
      profilePicId: imageId
    });

    return imageId;
  };
};

async function validate(data) {
  try {
    return await schema.validateAsync(data, { stripUnknown: true });
  } catch (e) {
    e.code = "ER_VALIDATE";
    throw e;
  }
}

const schema = joi
  .number()
  .positive()
  .required();
