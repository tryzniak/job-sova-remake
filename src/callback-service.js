const makeService = function(makeDB) {
  async function create(data) {
    const [callbackId] = await makeDB()
      .insert(data)
      .into("callbacks");
    return callbackId;
  }

  async function findByID(id) {
    const record = await makeDB()
      .select(["callbacks.*", "partners.email as partnerEmail"])
      .from("callbacks")
      .join("partners", "callbacks.partnerId", "partners.id")
      .where("callbacks.id", id)
      .first();
    if (!record) {
      throw new Error("Record not found");
    }

    return record;
  }

  async function update(id, fields) {
    return await makeDB()
      .update(fields)
      .from("callbacks")
      .where("id", id);
  }

  async function where(filter) {
    return await makeDB().select().from("callbacks").where(filter)
  }
  async function all() {
    return await makeDB().select().from("callbacks");
  }

  return {
    findByID,
    where,
    all,
    update,
    create
  };
};

module.exports = makeService;
