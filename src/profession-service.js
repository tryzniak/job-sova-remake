const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("professions")
      .where("id", id);
  }

  async function all() {
    return makeDB()
      .select()
      .from("professions")
      .then(results => results.map(result => ({ ...result })));
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("professions");
  }

  async function remove(id) {
    return makeDB()
      .delete()
      .from("professions")
      .where("id", id);
  }
  async function create(data) {
    return makeDB()
      .insert(data)
      .into("professions")
      .then(result => ({
        id: result[0],
        ...data
      }));
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("professions")
      .where("id", id)
      .first();
    if (!record) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...record };
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
