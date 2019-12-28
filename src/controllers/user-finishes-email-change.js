module.exports = useCase => async req => {
  await useCase(req.params.token);
  return {
    headers: { "Content-Type": "application/json" },
    status: 200
  };
};
