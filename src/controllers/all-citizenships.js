const makeController = require("./make-controller");
module.exports = makeController(async (req, useCase) => {
  const result = await useCase();
  return {
    status: 200,
    body: result
  };
});
