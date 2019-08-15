module.exports = function(ProfessionService) {
  return async () => {
    return await ProfessionService.all();
  };
};
