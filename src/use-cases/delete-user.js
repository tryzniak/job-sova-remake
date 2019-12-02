module.exports = function({ EmployerService, JobseekerService }) {
  return async (currentUser, id) => {
    if (currentUser.id !== id) {
      throw new Error("Unauthorized");
    }

    if (currentUser.role === "employer") {
      await EmployerService.remove(currentUser.id);
    } else if (currentUser.role === "jobseeker") {
      await JobseekerService.remove(currentUser.id);
    }
  };
};
