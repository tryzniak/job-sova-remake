module.exports = useCase => async req => {
  const result = await useCase(req.user, req.body.data);
  return {
    headers: { "Content-Type": "application/json" },
    status: 201,
    body: {
      data: { id: result }
    }
  };
};
