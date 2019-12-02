const ModerationStatus = require("../moderation-status");

module.exports = function(VacancyService) {
  return async (user, employerId, pagination) => {
    if (user.role === "jobseeker") {
      return await VacancyService.all({
        pagination,
        moderationStatus: ModerationStatus.OK,
        employerId
      });
    }

    if (
      (user.id == employerId && user.role === "employer") ||
      user.role === "admin"
    ) {
      return await VacancyService.all({ pagination, employerId });
    }
  };
};
