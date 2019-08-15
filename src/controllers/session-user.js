module.exports = UserService => controller => async req => {
  if (req.user) {
    return await controller(req);
  }

  try {
    const user = await UserService.findByEmail(req.session.userEmail);
    req.user = user;
    const r = await controller(req);
    return r;
  } catch (e) {
    return {
      headers: { "Content-Type": "application/json" },
      status: 404,
      body: {
        error: { code: "NOTFOUND", message: "Page not found" }
      }
    };
  }
};
