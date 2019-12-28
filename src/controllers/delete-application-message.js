module.exports = useCase => async req => {
  await useCase(req.params.id, req.user.id);
  return {
    headers: { "Content-Type": "application/json" },
    status: 200
  };
};
