module.exports = useCase => async req => {
  const id = await useCase(req.user, {
    resumeId: req.params.resumeId,
    vacancyId: req.params.vacancyId
  });
  return {
    headers: { "Content-Type": "application/json" },
    status: 201,
    body: {
      applicationId: id
    }
  };
};
