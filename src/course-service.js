const { notFound } = require("./errors");
const R = require("ramda");

const makeService = function(makeDB) {
  async function create(data) {
    const [id] = await makeDB()
      .into("courses")
      .insert(data);
    return id;
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("courses")
      .where("id", id)
      .first();
    if (!record) {
      throw new Error("Record not found");
    }

    return record;
  }

  async function update(id, fields) {
    const affectedRows = await makeDB()
      .update(fields)
      .from("courses")
      .where("id", id);

    if (!affectedRows) {
      throw notFound;
    }
  }

  async function all() {
    return await makeDB()
      .select()
      .from("courses");
  }

  async function remove(id) {
    const affectedRows = await makeDB()
      .delete()
      .from("courses")
      .where("id", id);
    if (!affectedRows) {
      throw notFound;
    }
  }

  return {
    findByID,
    update,
    create,
    remove,
    all
  };
};

module.exports = makeService;
