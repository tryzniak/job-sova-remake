const makeController = require("./make-controller");

module.exports = makeController(async reqInfo => {
  return {
    session: {},
    user: null,
    status: 200
  };
});
