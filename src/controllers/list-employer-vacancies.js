module.exports = function(useCase) {
  return async req => {
    const result = await useCase(req.user, req.params.id, {
      pageNumber: 0,
      perPage: 10
    });
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
      body: {
        data: result
      }
    };
  };
};
