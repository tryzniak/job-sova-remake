const R = require("ramda");

module.exports = (UserService, verifyPassword) => async (email, password) => {
  const user = await UserService.findByEmail(email);
  const match = await verifyPassword(user.passwordHash, password);
  if (!match) {
    const e = new Error("Passwords do not match");
    e.code = "ER_BAD_PASSWORD";
    throw e;
  }
  return R.omit(["passwordHash"], user);
};
