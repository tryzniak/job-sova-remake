module.exports = function(CallbackService) {
  return async user => {
    if (user.role === "admin") {
      return CallbackService.all();
    }

    throw new Error("Unauthorized");
  };
};
