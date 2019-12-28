const R = require("ramda");
const { notUnique, notFound } = require("./errors");

const makeService = function(makeDB) {
  async function update(id, data) {
    const affectedRows = await makeDB()
      .update(data)
      .from("employers")
      .join("users", "users.id", "employers.userId")
      .where({ userId: id, role: "employer" });
    if (!affectedRows) {
      throw notFound;
    }
  }

  async function all() {
    return makeDB()
      .select()
      .from("employers")
      .then(results => results.map(result => ({ ...result })));
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("employers");
  }

  async function remove(id) {
    const trx = await makeDB().transaction();
    try {
      const vacancyIds = R.map(
        R.prop("id"),
        await trx()
          .select(["vacancies.id"])
          .from("vacancies")
          .where("employerId", id)
      );

      await trx()
        .delete()
        .from("vacancySkills")
        .whereIn("vacancyId", vacancyIds);

      await trx()
        .delete()
        .from("vacancies")
        .whereIn("id", vacancyIds);

      await trx()
        .delete()
        .from("employers")
        .where("userId", id);

      const affectedRows = await trx()
        .delete()
        .from("users")
        .where("id", id);

      if (affectedRows === 0) {
        throw notFound;
      }

      if (affectedRows > 1) {
        throw notUnique;
      }

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function create(hasher, generateUpdatesToken, credentials) {
    const passwordHash = await hasher(credentials.password);
    const { title, about, phone, email, residence } = credentials;

    const trx = await makeDB().transaction();
    try {
      const [userId] = await trx("users").insert({
        email,
        phone,
        passwordHash,
        role: "employer",
        confirmedEmail: false
      });

      const liveUpdatesToken = generateUpdatesToken({
        id: userId,
        email,
        role: "employer"
      });

      const [employerId] = await trx("employers").insert({
        userId,
        title,
        about,
        residence
      });

      await trx("users")
        .update({ liveUpdatesToken })
        .where("id", userId);
      await trx.commit();
      return userId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function findByID(id) {
    const employer = await makeDB()
      .select()
      .from("employers")
      .where({ userId: id })
      .join("users", "users.id", "employers.userId")
      .first();
    if (!employer) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return R.omit(["passwordHash", "confirmedEmail", "userId"], employer);
  }

  return {
    create,
    clear,
    remove,
    update,
    all,
    findByID
  };
};

module.exports = makeService;
