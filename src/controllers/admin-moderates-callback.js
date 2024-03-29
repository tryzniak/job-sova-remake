module.exports = function(useCase) {
  return async req => {
    await useCase(req.user, req.params.id, req.body);
    return {
      headers: { "Content-Type": "application/json" },
      status: 200
    };
  };
};
