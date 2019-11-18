const R = require("ramda");
const { hash } = require("argon2");

const makeService = function(makeDB) {
  async function create(credentials) {
    const passwordHash = await hash(credentials.password);
    const {
      firstName,
      lastName,
      patronymicName,
      phone,
      email,
      username,
      gender,
      dateOfBirth,
      contacts
    } = credentials;

    const trx = await makeDB().transaction();
    try {
      const [userId] = await trx("users").insert({
        email,
        phone,
        passwordHash,
        username,
        role: "jobseeker",
        confirmedEmail: false
      });

      const [jobSeekerId] = await trx("jobSeekers").insert({
        userId,
        firstName,
        lastName,
        patronymicName,
        dateOfBirth,
        gender,
        contacts
      });
      await trx.commit();
      return userId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function update(id, fields) {
    return await makeDB()
      .update(fields)
      .from("jobSeekers")
      .join("users", "users.id", "jobSeekers.userId")
      .where({ userId, role: "jobseeker" });
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("jobSeekers")
      .join("users", "users.id", "jobSeekers.userId")
      .where({ id })
      .first();

    if (!record) {
      throw new Error("Record not found");
    }

    return R.filter(
      R.identity,
      R.over(
        R.lensProp("confirmedEmail"),
        Boolean,
        R.omit(
          [
            "passwordHash",
            "newEmail",
            "passwordResetToken",
            "passwordResetRequestedAt",
            "emailChangeToken",
            "emailChangeRequestedAt"
          ],
          record
        )
      )
    );
  }

  return {
    create,
    update,
    findByID
  };
};
module.exports = makeService;
