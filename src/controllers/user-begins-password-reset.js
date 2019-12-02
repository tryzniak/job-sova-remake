module.exports = useCase => async req => {
  try {
    const result = await useCase(req.body.data.email);
    return {
      headers: { "Content-Type": "application/json" },
      status: 200
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
