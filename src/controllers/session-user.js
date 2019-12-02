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
        error: {
          code: "UNAUTHORIZED",
          message: "You need to signin to view the page"
        }
      }
    };
  }
  return await controller(req);
};
