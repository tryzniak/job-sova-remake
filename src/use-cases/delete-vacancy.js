const yup = require("yup");
const R = require("ramda");

module.exports = function(VacancyService) {
  return async id => {
    return await VacancyService.remove(id);
  };
};
