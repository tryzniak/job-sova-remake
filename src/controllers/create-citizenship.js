module.exports = useCase => async req => {
  const result = await useCase(req.user, req.body);
  return {
    headers: { "Content-Type": "application/json" },
    status: 201,
    body: {
      id: result
    }
  };
};
