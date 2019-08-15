module.exports = function(DisabilityService) {
  return async () => {
    return await DisabilityService.all();
  };
};
