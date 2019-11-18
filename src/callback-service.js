const makeService = function(makeDB) {
  async function create(data) {
    const [callbackId] = await makeDB()
      .insert(data)
      .into("callbacks");
    return callbackId;
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("callbacks")
      .where("id", id)
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

  return {
    findByID,
    update,
    create
  };
};

module.exports = makeService;
