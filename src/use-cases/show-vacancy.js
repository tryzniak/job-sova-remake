module.exports = function(VacancyService) {
  return async (user, id) => {
    const result = await VacancyService.findByID(id);
    if (user.role === "jobseeker") {
      if (result.moderationStatus === ModerationStatus.OK) {
        return result;
      }
    }

    if (user.role === "admin") {
      return result;
    }

    if (user.role === "employer" && result.employerId === user.id) {
      return result;
    }

    throw new Error("Not Found");
  };
};
