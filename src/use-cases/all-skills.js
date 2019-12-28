const R = require("ramda");
module.exports = function(SkillService) {
  return async user => {
    if (user.role === "admin") {
      return await SkillService.all();
    }

    return R.map(
      R.omit(["moderationStatus"]),
      await SkillService.all({ moderationStatus: "OK" })
    );
  };
};
