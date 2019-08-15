const { verify } = require("argon2");

module.exports = async function(hash, password) {
  try {
    return verify(hash, password);
  } catch (_) {
    return false;
  }
};
