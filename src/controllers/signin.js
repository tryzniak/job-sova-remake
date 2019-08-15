module.exports = function(signinUseCase) {
  return async req => {
    try {
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
    } catch (e) {
      return {
        headers: { "Content-Type": "application/json" },
        status: 400,
        body: {
          error: { code: e.code, message: e.message }
        }
      };
    }
  };
};
