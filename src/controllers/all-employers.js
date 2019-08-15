module.exports = function(useCase) {
  return async req => {
    try {
      return {
        headers: { "Content-Type": "application/json" },
        status: 200,
        body: {
          data: await useCase()
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
};
