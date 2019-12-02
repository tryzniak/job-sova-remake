const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("citizenships")
      .where("id", id);
  }

  async function all() {
    return makeDB()
      .select()
      .from("citizenships");
  }

  async function create(data) {
    return makeDB()
      .insert(data)
      .into("citizenships")
      .then(result => ({
        id: result[0],
        ...data
      }));
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("citizenships")
      .where("id", id)
      .first();

    if (!record) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }

    return record;
  }

  return {
    create,
    update,
    all,
    findByID
  };
};

module.exports = makeService;
