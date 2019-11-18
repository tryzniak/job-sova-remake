module.exports = function(VacancyService) {
  return async id => {
    return await VacancyService.findByID(id);
  };
};
