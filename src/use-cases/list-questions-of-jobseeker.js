module.exports = function(QuestionService) {
  return async (user, jobSeekerId) => {
    if (user.role === "jobseeker" && user.id == jobSeekerId) {
      return QuestionService.where({ jobSeekerId: user.id });
    }

    throw new Error("Unauthorized");
  };
};
