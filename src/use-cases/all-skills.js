module.exports = function(SkillService) {
  return async () => {
    return await SkillService.all();
  };
};
