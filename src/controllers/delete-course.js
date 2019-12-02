module.exports = useCase => async req => {
  await useCase(req.user, req.params.id);
  return {
    headers: { "Content-Type": "application/json" },
    status: 200
  };
};
