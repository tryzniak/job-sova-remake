module.exports = function(GeocodeService) {
  return async address => {
    return await GeocodeService.geocode(address);
  };
};
