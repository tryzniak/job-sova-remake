module.exports = useCase => async req => {
  const id = await useCase(req.user, {
    jobSeekerId: req.params.jobSeekerId,
    vacancyId: req.params.vacancyId,
    ...req.body.data
  });
  return {
    headers: { "Content-Type": "application/json" },
    status: 201,
    body: {
      data: { applicationId: id }
    }
  };
};
