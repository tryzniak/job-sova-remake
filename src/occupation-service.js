const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("occupations")
      .where("id", id);
  }

  async function all() {
    return makeDB()
      .select()
      .from("occupations")
      .then(results => results.map(result => ({ ...result })));
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("occupations");
  }

  async function remove(id) {
    return makeDB()
      .delete()
      .from("occupations")
      .where("id", id);
  }
  async function create(data) {
    return makeDB()
      .insert(data)
      .into("occupations")
      .then(result => ({
        id: result[0],
        ...data
      }));
  }

  async function findByID(id) {
    const occupation = await makeDB()
      .select()
      .from("occupations")
      .where("id", id)
      .first();
    if (!occupation) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...occupation };
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
