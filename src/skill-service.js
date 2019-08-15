const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("skills")
      .where("id", id);
  }

  async function all() {
    return makeDB()
      .select()
      .from("skills")
      .then(results => results.map(result => ({ ...result })));
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("skills");
  }

  async function remove(id) {
    return makeDB()
      .delete()
      .from("skills")
      .where("id", id);
  }
  async function create(data) {
    return makeDB()
      .insert(data)
      .into("skills")
      .then(result => ({
        id: result[0],
        ...data
      }));
  }

  async function findByID(id) {
    const skill = await makeDB()
      .select()
      .from("skills")
      .where("id", id)
      .first();
    if (!skill) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...skill };
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
