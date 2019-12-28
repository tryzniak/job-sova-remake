module.exports = function(QuestionService) {
  return async user => {
    if (user.role === "admin") {
      return QuestionService.all();
    }

    throw new Error("Unauthorized");
  };
};
