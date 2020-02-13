module.exports = function(useCase) {
  return async req => {
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
      body: await useCase(req.query.q)
    };
  };
};
