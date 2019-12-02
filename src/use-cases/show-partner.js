const R = require("ramda");

module.exports = function(PartnerService) {
  return async (user, id) => {
    const partner = await PartnerService.findByID(id);
    if (user.role === "jobseeker" || user.role === "employer") {
      return R.omit(["email"], partner);
    }

    return partner;
  };
};
