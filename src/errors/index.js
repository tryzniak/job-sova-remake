const makeError = (code, message) => {
  const e = new Error(message);
  e.code = code;
  return e;
};

module.exports = {
  errorToJson: ({ code, message }) => ({ code, message }),
  invalidSignin: makeError("ER_SIGNIN", "Cannot signin. Bad credentials"),
  notFound: makeError("ER_NOT_FOUND", "Record not found"),
  unauthorized: makeError("ER_UNAUTHORIZED", "Unauthorized"),
  notUnique: makeError("ER_NOT_UNIQUE", "Should be unique")
};
