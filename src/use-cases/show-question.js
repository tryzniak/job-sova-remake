module.exports = function(QuestionService) {
  return async (currentUser, id) => {
    if (currentUser.role === "jobseeker") {
      const result = QuestionService.where({id, jobSeekerId: currentUser.id})
      if (result.length) {
        return result[0]
      }
    }

    if (currentUser.role === "admin") {
      const result = await QuestionService.where({id})
      if (result.length) {
        return result[0]
      }
    }

    throw new Error("Not found")
  };
};
