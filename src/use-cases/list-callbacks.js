module.exports = function(CallbackService) {
  return async (user, fields) => {
    if (user.role === "jobseeker") {
      return CallbackService.where({jobSeekerId: user.id})
    }

    if (user.role === "admin") {
      return CallbackService.all()
    }

    throw new Error("Unauthorized")

  };
};

