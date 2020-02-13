module.exports = useCase => async req => {
  const result = await useCase();
  return {
    headers: { "Content-Type": "application/json" },
    status: 200,
    body: result
  };
};
