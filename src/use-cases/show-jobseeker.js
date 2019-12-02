module.exports = function(JobseekerService) {
  return async (user, id) => {
    if (user.role === "admin" || user.role === "employer") {
      return await JobseekerService.findByID(id);
    }

    if (user.id == id) {
      return await JobseekerService.findByID(id);
    }

    throw new Error("Unauthorized");
  };
};
