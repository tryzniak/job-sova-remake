const R = require("ramda");
const { hash } = require("argon2");
const nanoid = require("nanoid/async");
const { notFound } = require("./errors");

const makeUserService = function(makeDB) {
  async function changeEmail(token) {
    const emailChangeTimeWindow = 20;
    return makeDB()
      .update({
        email: makeDB().ref("newEmail"),
        newEmail: null,
        confirmedEmail: true,
        emailChangeToken: null
      })
      .from("users")
      .where({ emailChangeToken: token })
      .whereRaw("TIMESTAMPDIFF(MINUTE, emailChangeRequestedAt, NOW()) <= ?", [
        emailChangeTimeWindow
      ]);
  }

  async function requestEmailChange(currentEmail, newEmail, token) {
    return makeDB()
      .update({
        newEmail,
        emailChangeToken: token,
        emailChangeRequestedAt: makeDB().fn.now()
      })
      .from("users")
      .where({ email: currentEmail });
  }

  async function resetPassword(token, newPasswordHash) {
    const passwordResetTimeWindow = 20;
    return makeDB()
      .update({
        passwordResetToken: null,
        passwordHash: newPasswordHash
      })
      .from("users")
      .where({ passwordResetToken: token })
      .whereRaw("TIMESTAMPDIFF(MINUTE, passwordResetRequestedAt, NOW()) <= ?", [
        passwordResetTimeWindow
      ]);
  }

  async function updateWhere(filter, fields) {
    const affectedRows = await makeDB()
      .update(fields)
      .from("users")
      .where(filter);
    if (!affectedRows) {
      throw new Error("Record not found");
    }
  }

  async function remove(id) {
    return makeDB()
      .delete()
      .from("users")
      .where("id", id);
  }

  async function clear() {
    return makeDB()
      .delete()
      .from("users");
  }

  async function rollbackEmailChange(userId) {
    makeDB()
      .update({ email })
      .whereNotNull("email");
  }

  async function count() {
    const row = await makeDB()
      .count("id as CNT")
      .from("users");
    return row[0].CNT;
  }

  async function create(userCredentials) {
    const passwordHash = await hash(userCredentials.password);
    const credentialsWithoutPassword = R.omit(
      ["password", "passwordConfirmation"],
      userCredentials
    );
    return makeDB()
      .insert({ ...credentialsWithoutPassword, passwordHash })
      .into("users")
      .then(result => ({
        ...credentialsWithoutPassword,
        passwordHash,
        id: result[0]
      }));
  }

  async function findByEmail(email) {
    const results = await makeDB().raw(
      "select u.id, u.passwordHash, u.liveUpdatesToken, u.email, u.phone, u.role, e.title, e.about, e.residence, j.firstName, j.lastName, j.patronymicName, j.gender, j.dateOfBirth from users u left join employers e on u.id = e.userId left join jobSeekers j on j.userId = u.id where u.email = ? and u.confirmedEmail = TRUE",
      [email]
    );
    if (R.isEmpty(results[0])) {
      throw notFound;
    }
    return R.filter(
      R.compose(
        R.not,
        R.isNil
      ),
      results[0][0]
    );
  }

  async function update(id, fields) {
    const affectedRows = await makeDB()
      .update(fields)
      .from("users")
      .where({ id });

    if (!affectedRows) {
      throw notFound;
    }
  }

  async function findByID(id) {
    const results = await makeDB().raw(
      "select u.id, u.liveUpdatesToken, u.username, u.email, u.phone, u.role, e.title, e.about, e.residence, j.firstName, j.lastName, j.patronymicName, j.gender, j.dateOfBirth from users u left join employers e on u.id = e.userId left join jobSeekers j on j.userId = u.id where u.id = ? and u.confirmedEmail = TRUE",
      [id]
    );
    if (R.isEmpty(results[0])) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return R.filter(
      R.compose(
        R.not,
        R.isNil
      ),
      results[0][0]
    );
  }

  async function where(filter) {
    return makeDB()
      .select()
      .from("users")
      .where(filter);
  }

  return {
    create,
    remove,
    findByID,
    findByEmail,
    clear,
    count,
    update,
    rollbackEmailChange,
    changeEmail,
    resetPassword,
    updateWhere,
    changeEmail,
    where,
    requestEmailChange
  };
};
module.exports = makeUserService;
