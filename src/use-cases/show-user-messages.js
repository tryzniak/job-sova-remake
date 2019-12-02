module.exports = function(ChatService) {
  return async (user, userId) => {
    return await ChatService.findUserMessages(user);
  };
};
