module.exports = function(useCase) {
  return async req => {
    const result = await useCase(req.user, req.params.id, req.query);
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
      body: {
        data: result
      }
    };
  };
};
