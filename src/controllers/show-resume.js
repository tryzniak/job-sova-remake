module.exports = useCase => async req => {
  try {
    const result = await useCase(req.user, req.params.id);
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
      body: result
    };
  } catch (e) {
    if (e.code === "ER_NOT_FOUND") {
      return {
        headers: { "Content-Type": "application/json" },
        status: 404
      };
    }
    throw e;
  }
};
