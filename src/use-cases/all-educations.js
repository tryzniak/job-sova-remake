module.exports = function(EducationService) {
  return async () => {
    return await EducationService.all();
  };
};
