const onlyAuthenticated = controller => async req => {
  if (req.user) {
    return await controller(req);
  }

  return {
    headers: { "Content-Type": "application/json" },
    status: 404,
    body: {
      error: { code: "NOTFOUND", message: "Page not found" }
    }
  };
};

module.exports = onlyAuthenticated;
