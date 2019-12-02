module.exports = function(CourseService) {
  return async () => {
    return await CourseService.all();
  };
};
