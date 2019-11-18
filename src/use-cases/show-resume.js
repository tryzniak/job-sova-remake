module.exports = function(ResumeService) {
  return async id => {
    return await ResumeService.findByID(id);
  };
};
