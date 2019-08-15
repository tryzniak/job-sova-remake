function signupUser(signupUserUseCase, signIn) {
  return async req => {
    const isAllowedRole = ["donor", "donee"].includes(req.body.data.role);
    if (!isAllowedRole) {
      return {
        headers: { "Content-Type": "application/json" },
        status: 400,
        body: {
          error: {
            code: "ER_SIGNUP",
            message: "Bad Payload"
          }
        }
      };
    }

    try {
      const result = await signupUserUseCase(req.body.data);
      if (req.body.data.rememberMe) {
        // inject use case?
        return signIn(req);
      }

      return {
        headers: { "Content-Type": "application/json" },
        status: 201,
        body: {
          data: result
        }
      };
    } catch (e) {
      return {
        headers: { "Content-Type": "application/json" },
        status: 400,
        body: {
          error: {
            message: e.message,
            code: e.code || "ER_SIGNUP"
          }
        }
      };
    }
  };
}

module.exports = signupUser;
