module.exports = (
  signupDonee,
  signupDonor,
  sendVerificationEmail
) => async credentials => {
  if (credentials.role === "donor") {
    const result = signupDonor(credentials);
    await sendVerificationEmail(credentials);
    return result;
  }

  if (credentials.role === "donee") {
    const result = signupDonee(credentials);
    await sendVerificationEmail(credentials);
    return result;
  }

  const e = new Error("Unrecognized role " + credentials.role);
  e.code = "ER_BAD_ROLE";
  throw e;
};
