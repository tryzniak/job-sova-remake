const nodemailer = require("nodemailer");

module.exports = config => {
  const transport = nodemailer.createTransport(config);
  return async ({ to, bodyHtml, body, subject }) => {
    await transport.sendMail({
      from: config.from,
      to: to.join(", "),
      text: body,
      html: bodyHtml,
      subject
    });
  };
};
