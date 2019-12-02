const yup = require("yup");
const R = require("ramda");

module.exports = function(VacancyService) {
  return async (user, id) => {
    if (user.role !== "employer") {
      throw new Error("Unauthorized");
    }
    await VacancyService.removeForEmployer(user.id, id);
  };
};
