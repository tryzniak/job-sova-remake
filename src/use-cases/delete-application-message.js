const yup = require("yup");

module.exports = function(ApplicationService) {
  return async (messageId, userId) => {
    return await ApplicationService.removeMessage(
      await validate({ messageId, userId })
    );
  };
};

const schema = yup.object().shape({
  userId: yup
    .number()
    .integer()
    .positive()
    .required(),
  messageId: yup
    .number()
    .integer()
    .positive()
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
