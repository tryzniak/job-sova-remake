const ModerationStatus = require("../moderation-status");

module.exports = function(ResumeService) {
  return async (user, jobSeekerId, filter) => {
    if (user.role === "employer") {
      return await ResumeService.all({
        paginationState: filter.paginationState,
        moderationStatus: ModerationStatus.OK,
        jobSeekerId
      });
    }

    if (
      (user.id == jobSeekerId && user.role === "jobseeker") ||
      user.role === "admin"
    ) {
      return await ResumeService.all({
        paginationState: filter.paginationState,
        jobSeekerId
      });
    }

    throw new Error("Unauthorized");
  };
};
