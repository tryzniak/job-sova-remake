module.exports = function(ChatService) {
  return async (user, messageId) => {
    return await ChatService.findMessage(user, messageId);
  };
};
