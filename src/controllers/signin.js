module.exports = function(signinUseCase) {
  return async req => {
    const { email, password } = req.body.data;
    const payload = await signinUseCase(email, password);
    return {
      headers: { "Content-Type": "application/json" },
      session: { userEmail: payload.email },
      status: 200,
      body: {
        data: payload
      }
    };
  };
};
