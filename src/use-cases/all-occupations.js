module.exports = function(OccupationService) {
  return async () => {
    return await OccupationService.all();
  };
};
