module.exports = useCase => async req => {
  const result = await useCase(req.user);
  return {
    headers: { "Content-Type": "application/json" },
    status: 200,
    body: {
      data: result
    }
  };
};
