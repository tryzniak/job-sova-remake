module.exports = useCase => async req => {
  const result = await useCase(req.user, req.query);
  return {
    headers: { "Content-Type": "application/json" },
    status: 200,
    body: result
  };
};
