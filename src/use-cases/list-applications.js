const yup = require("yup");

module.exports = function(ApplicationService) {
  return async user => {
    const filter = {};
    if (user.role === "employer") {
      filter.employerId = user.id;
    } else if (user.role === "jobseeker") {
      filter.jobSeekerId = user.id;
    }

    return await ApplicationService.where(filter);
  };
};
