module.exports = function(CallbackService) {
  return async (user, jobSeekerId) => {
    if (user.role === "jobseeker" && user.id == jobSeekerId) {
      return CallbackService.where({ jobSeekerId: user.id });
    }

    throw new Error("Unauthorized");
  };
};
