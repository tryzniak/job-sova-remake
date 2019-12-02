module.exports = useCase => async req => {
  try {
    await useCase(req.params.id, req.body.data);
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
