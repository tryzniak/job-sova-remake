module.exports = useCase => async req => {
  try {
    const result = await useCase(req.body.data);
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
        error: { code: e.code, message: e.message }
      }
    };
  }
};
