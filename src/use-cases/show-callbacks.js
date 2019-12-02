module.exports = function(CallbackService) {
  return async (currentUser, id) => {
    if (currentUser.role === "jobseeker") {
      const result = CallbackService.where({id, jobSeekerId: currentUser.id})
      if (result.length) {
        return result[0]
      }
    }

    if (currentUser.role === "admin") {
      const result = await CallbackService.where({id})
      if (result.length) {
        return result[0]
      }
    }

    throw new Error("Not found")
  };
};
