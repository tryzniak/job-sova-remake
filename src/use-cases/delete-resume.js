module.exports = function(ResumeService) {
  return async id => {
    return await ResumeService.remove(id);
  };
};
