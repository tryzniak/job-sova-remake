const makeService = function(makeDB) {
  async function create(data) {
    const [id] = await makeDB()
      .insert(data)
      .into("questions");
    return id;
  }

  async function findByID(id) {
    const record = await makeDB()
      .select(["questions.*", "partners.email as partnerEmail"])
      .from("questions")
      .join("partners", "partners.id", "questions.partnerId")
      .where("questions.id", id)
      .first();
    if (!record) {
      throw new Error("Record not found");
    }

    return record;
  }

  async function update(id, fields) {
    const rowsAffected = await makeDB()
      .update(fields)
      .from("questions")
      .where("id", id);
    if (rowsAffected > 1) {
      const err = new Error("Record not unique");
      err.code = "DB_NOT_UNIQUE";
    }

    if (rowsAffected === 0) {
      const err = new Error("Record not found");
      err.code = "DB_NOT_FOUND";
    }
  }
  async function where(filter) {
    return await makeDB().select().from("questions").where(filter)
  }
  async function all() {
    return await makeDB().select().from("questions");
  }

  return {
    findByID,
    update,
    create,
    all,
    where
  };
};

module.exports = makeService;
