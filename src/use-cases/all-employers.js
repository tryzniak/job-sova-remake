module.exports = function(EmployerService) {
  return async () => {
    return await EmployerService.all();
  };
};
