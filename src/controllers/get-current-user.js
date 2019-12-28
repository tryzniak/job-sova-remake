module.exports = async req => {
  return {
    headers: { "Content-Type": "application/json" },
    status: 200,
    body: {
      data: req.user
    }
  };
};
