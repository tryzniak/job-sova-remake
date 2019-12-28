const R = require("ramda");

module.exports = function(SkillService) {
  return async (user, id) => {
    if (user.role === "admin") {
      return await SkillService.findByID(id);
    }
    const result = await SkillService.all({ moderationStatus: "OK", id });
    return R.omit(["moderationStatus"], result[0]);
  };
};
