module.exports = function(QuestionService) {
  return async (user, fields) => {
    if (user.role === "jobseeker") {
      return QuestionService.where({jobSeekerId: user.id})
    }

    if (user.role === "admin") {
      return QuestionService.all()
    }

    throw new Error("Unauthorized")

  };
};

