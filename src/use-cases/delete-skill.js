module.exports = function(SkillService) {
  return async id => {
    return await SkillService.remove(id);
  };
};
