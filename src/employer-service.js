const R = require("ramda");

const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("employers")
      .join("users", "users.id", "employers.userId")
      .where({ userId: id, role: "employer" });
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

      await trx()
        .delete()
        .from("users")
        .where("id", id);

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
