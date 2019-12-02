const R = require("ramda");

module.exports = implementation => useCase => async req => {
  const defaultHeaders = { "Content-Type": "application/json" };
  try {
    const result = await implementation(
      {
        currentUser: req.user,
        params: req.params,
        body: req.body,
        query: req.query
      },
      useCase ? useCase : R.identity
    );

    const payload = {
      headers: defaultHeaders,
      status: result.status
    };

    if (result.session) {
      payload.session = result.session;
    }

    if (result.user) {
      payload.user = result.user;
    }

    if (result.body) {
      payload.body = { data: result.body };
    }

    return result;
  } catch (e) {
    console.error(e);
    if (e.code !== "ER_VALIDATE") {
      return {
        headers: defaultHeaders,
        status: 500,
        body: {
          error: {
            message: "Internal server error",
            code: "ER_SERVER"
          }
        }
      };
    }

    return {
      headers: defaultHeaders,
      status: 400,
      body: {
        error: {
          message: e.message,
          code: e.code
        }
      }
    };
  }
};
