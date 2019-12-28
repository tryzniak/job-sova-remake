const { notFound, invalidSignin } = require("../errors");
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
      if (e.code === invalidSignin.code) {
        return {
          headers: { "Content-Type": "application/json" },
          status: 401,
          body: {
            error: {
              code: e.code,
              message: e.message
            }
          }
        };
      }

      if (e.code === notFound.code) {
        return {
          headers: { "Content-Type": "application/json" },
          status: 401,
          body: {
            error: {
              code: invalidSignin.code,
              message: invalidSignin.message
            }
          }
        };
      }
      throw e;
    }
  };
};
