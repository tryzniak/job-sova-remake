const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("disabilities")
      .where("id", id);
  }

  async function all() {
    return makeDB()
      .select()
      .from("disabilities")
      .then(results => results.map(result => ({ ...result })));
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("disabilities");
  }

  async function remove(id) {
    return makeDB()
      .delete()
      .from("disabilities")
      .where("id", id);
  }
  async function create(data) {
    return makeDB()
      .insert(data)
      .into("disabilities")
      .then(result => ({
        id: result[0],
        ...data
      }));
  }

  async function findByID(id) {
    const disability = await makeDB()
      .select()
      .from("disabilities")
      .where("id", id)
      .first();
    if (!disability) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...disability };
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
