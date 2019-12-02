module.exports = function(CitizenshipService) {
  return async () => {
    return await CitizenshipService.all();
  };
};
