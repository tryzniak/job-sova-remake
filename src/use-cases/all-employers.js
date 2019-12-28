module.exports = function(EmployerService) {
  return async user => {
    if (user.role === "employer") {
      throw new Error("Unauthorized");
    }

    return await EmployerService.all();
  };
};
