module.exports = useCase => async req => {
  const result = await useCase(req.params.id, req.user.id);
  return {
    headers: { "Content-Type": "application/json" },
    status: 200,
    body: {
      data: result
    }
  };
};
