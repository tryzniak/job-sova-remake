const ModerationStatus = require("../moderation-status");

module.exports = function(ResumeService) {
  return async (currentUser, id) => {
    const resume = await ResumeService.findByID(id);
    if (
      currentUser.role === "jobseeker" &&
      resume.jobSeekerId !== currentUser.id
    ) {
      const err = new Error("Not found");
      err.code = "ER_NOT_FOUND";
      throw err;
    }

    if (
      currentUser.role === "employer" &&
      resume.moderationStatus !== ModerationStatus.OK
    ) {
      const err = new Error("Not found");
      err.code = "ER_NOT_FOUND";
      throw err;
    }

    return resume;
  };
};
