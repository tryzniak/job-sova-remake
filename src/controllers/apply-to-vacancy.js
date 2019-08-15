module.exports = useCase => async req => {
  try {
    const id = await useCase({
      jobSeekerId: req.user.id,
      resumeId: req.body.data.resumeId,
      vacancyId: req.body.vacancyId
    });
    return {
      headers: { "Content-Type": "application/json" },
      status: 201,
      body: {
        data: { applicationId: id }
      }
    };
  } catch (e) {
    return {
      headers: { "Content-Type": "application/json" },
      status: 400,
      body: {
        error: { code: e.code, message: e.message }
      }
    };
  }
};
