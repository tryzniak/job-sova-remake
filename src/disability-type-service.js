const makeService = function(makeDB) {
  async function update(id, data) {
    return makeDB()
      .update(data)
      .from("disabilityTypes")
      .where("id", id);
  }

  async function all() {
    return makeDB()
      .select()
      .from("disabilityTypes")
      .then(results => results.map(result => ({ ...result })));
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("disabilityTypes");
  }

  async function remove(id) {
    return makeDB()
      .delete()
      .from("disabilityTypes")
      .where("id", id);
  }
  async function create(data) {
    return makeDB()
      .insert(data)
      .into("disabilityTypes")
      .then(result => ({
        id: result[0],
        ...data
      }));
  }

  async function findByID(id) {
    const disability = await makeDB()
      .select()
      .from("disabilityTypes")
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
