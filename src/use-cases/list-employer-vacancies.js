const ModerationStatus = require("../moderation-status");

module.exports = function(VacancyService) {
  return async (user, employerId, paginationState) => {
    if (user.role === "jobseeker") {
      return await VacancyService.all({
        paginationState,
        moderationStatus: ModerationStatus.OK,
        employerId
      });
    }

    if (
      (user.id == employerId && user.role === "employer") ||
      user.role === "admin"
    ) {
      return await VacancyService.all({ paginationState, employerId });
    }
  };
};
