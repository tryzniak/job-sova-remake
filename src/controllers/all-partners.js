module.exports = function(useCase) {
  return async req => {
    const partners = await useCase(req.user);
    return {
      headers: { "Content-Type": "application/json" },
      status: 200,
      body: {
        data: partners
      }
    };
  };
};
