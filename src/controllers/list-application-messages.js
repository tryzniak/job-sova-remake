module.exports = function(useCase) {
  return async req => {
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
      body: {
        data: await useCase(req.user.id, req.params.applicationId)
      }
    };
  };
};
