const { errorToJson, unauthorized } = require("../errors");

module.exports = (UserService /*signout*/) => controller => async req => {
  try {
    if (!req.user) {
      req.user = await UserService.findByEmail(req.session.userEmail);
    }
  } catch (e) {
    req.session.userEmail = undefined;
    req.user = undefined;
    return {
      headers: { "Content-Type": "application/json" },
      status: 401,
      body: {
        error: errorToJson(unauthorized)
      }
    };
  }

  return await controller(req);
};
