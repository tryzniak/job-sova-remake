const { verify } = require("argon2");

module.exports = async function(hash, password) {
  try {
    return await verify(hash, password);
  } catch (_) {
    return false;
  }
};
