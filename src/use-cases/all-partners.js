const R = require("ramda");

module.exports = function(PartnerService) {
  return async user => {
    const partners = await PartnerService.all();
    if (user.role !== "admin") {
      return R.map(R.omit(["email"]), partners);
    }

    return partners;
  };
};
