module.exports = function(CourseService) {
  return async id => {
    return await CourseService.findByID(id);
  };
};
