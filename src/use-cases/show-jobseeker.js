module.exports = function(JobseekerService) {
  return async id => {
    return await JobseekerService.findByID(id);
  };
};
