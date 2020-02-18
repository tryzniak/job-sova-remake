module.exports = function(useCase) {
  return async req => {
    try {
      return {
        headers: { "Content-Type": "application/json" },
        status: 200,
        body: await useCase(req.user, req.params.id, req.query.moderationStatus)
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
};
