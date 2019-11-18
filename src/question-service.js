const makeService = function(makeDB) {
  async function create(data) {
    const [id] = await makeDB()
      .insert(data)
      .into("questions");
    return id;
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("questions")
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
      .from("questions")
      .where("id", id);
  }

  return {
    findByID,
    update,
    create
  };
};

module.exports = makeService;
