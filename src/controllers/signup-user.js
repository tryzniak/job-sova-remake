function signupUser(signupUserUseCase) {
  return async req => {
    const result = await signupUserUseCase(req.body.data);
    return {
      headers: { "Content-Type": "application/json" },
      status: 201,
      body: {
        data: result
      }
    };
  };
}

module.exports = signupUser;
