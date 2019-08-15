module.exports = useCase => async req => {
  try {
    const result = await useCase(req.params.userId, req.file);
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
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
