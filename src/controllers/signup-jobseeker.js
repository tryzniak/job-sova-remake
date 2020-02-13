module.exports = useCase => async req => {
  try {
    const result = await useCase(req.body);
    return {
      headers: { "Content-Type": "application/json" },
      status: 201,
      body: result
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
