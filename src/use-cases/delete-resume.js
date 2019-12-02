module.exports = function(ResumeService) {
  return async (user, id) => {
    if (user.role !== "jobseeker") {
      throw new Error("Unauthorized");
    }

    await ResumeService.removeForJobSeeker(user.id, id);
  };
};
