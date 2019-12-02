const yup = require("yup");

module.exports = function(ApplicationService, broadcast) {
  return async (applicationId, userId, data) => {
    const id = await ApplicationService.sendMessage(
      await validate({ applicationId, userId, ...data })
    );

    broadcast({
      resource: "chat",
      privateMessage: {
        sendToUserId: 73
      }
    });
  };
};

const schema = yup.object().shape({
  userId: yup
    .number()
    .integer()
    .positive()
    .required(),
  applicationId: yup
    .number()
    .integer()
    .positive()
    .required(),
  message: yup
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
