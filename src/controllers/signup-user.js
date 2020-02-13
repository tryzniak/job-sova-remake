function signupUser(signupUserUseCase) {
  return async req => {
    const result = await signupUserUseCase(req.body);
    return {
      headers: { "Content-Type": "application/json" },
      status: 201,
      body: result
    };
  };
}

module.exports = signupUser;
