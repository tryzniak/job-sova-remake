const R = require("ramda");
const joi = require("@hapi/joi");
const datefns = require("date-fns");

module.exports = function(UserService, sendEmail, generateToken) {
  return async email => {
    const validEmail = await validate(email);
    const token = await generateToken();

    const res = await UserService.updateWhere(
      { email: validEmail },
      {
        passwordResetToken: token,
        passwordResetRequestedAt: datefns.format(
          Date.now(),
          "yyyy-L-dd HH:mm:ss"
        )
      }
    );
    await sendEmail(validEmail, token);
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
  .string()
  .email()
  .required();
