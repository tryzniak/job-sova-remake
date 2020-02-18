module.exports = useCase => async req => {
  const id = await useCase(req.user, {
    jobSeekerId: req.params.jobSeekerId,
    vacancyId: req.params.vacancyId,
    ...req.body
  });
  return {
    headers: { "Content-Type": "application/json" },
    status: 201,
    body: {
      applicationId: id
    }
  };
};
