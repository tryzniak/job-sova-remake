const R = require("ramda");
const { hash } = require("argon2");
const { notUnique, notFound } = require("./errors");

const makeService = function(makeDB) {
  async function create(hash, generateUpdatesToken, credentials) {
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
    const affectedRows = await makeDB()
      .update(fields)
      .from("jobSeekers")
      .join("users", "users.id", "jobSeekers.userId")
      .where({ userId: id, role: "jobseeker" });
    if (!affectedRows) {
      throw notFound;
    }
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

  async function remove(id) {
    const trx = await makeDB().transaction();
    try {
      const resumeIds = R.map(
        R.prop("id"),
        await trx()
          .select(["id"])
          .from("resumes")
          .where("jobseekerId", id)
      );

      await Promise.all(
        R.map(
          table =>
            trx()
              .delete()
              .from(table)
              .whereIn("resumeId", resumeIds),
          ["resumeSkills", "resumeExperiences", "resumeEducations"]
        )
      );

      await trx()
        .delete()
        .from("resumes")
        .where("jobSeekerId", id);

      await trx()
        .delete()
        .from("jobSeekers")
        .where("userId", id);

      const rowsAffected = await trx()
        .delete()
        .from("users")
        .where("id", id);

      if (!rowsAffected) {
        throw notFound;
      }

      if (rowsAffected > 1) {
        throw notUnique;
      }

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  return {
    create,
    remove,
    update,
    findByID
  };
};
module.exports = makeService;
