const R = require("ramda");

const onlyRoles = roles => controller => async req => {
  if (!R.contains(R.path(["user", "role"], req), roles)) {
    return {
      headers: { "Content-Type": "application/json" },
      status: 404,
      body: {
        error: { code: "NOTFOUND", message: "Page not found" }
      }
    };
  }
  return await controller(req);
};

module.exports = onlyRoles;
