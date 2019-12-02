module.exports = function(CourseService) {
  return async (user, id) => {
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    await CourseService.remove(id);
  };
};
