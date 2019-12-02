const R = require("ramda");

const onlyRoles = roles => controller => async req => {
  if (!R.contains(R.path(["user", "role"], req), roles)) {
    return {
      headers: { "Content-Type": "application/json" },
      status: 401,
      body: {
        error: {
          code: "UNAUTHORIZED",
          message: "You need to login to view the page"
        }
      }
    };
  }
  return await controller(req);
};

module.exports = onlyRoles;
