const R = require("ramda");
const { notFound } = require("./errors");

const makeService = function(makeDB) {
  async function create(data) {
    const [id] = await makeDB()
      .into("partners")
      .insert(data);
    return id;
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("partners")
      .where("id", id)
      .first();
    if (!record) {
      throw notFound;
    }

    return record;
  }

  async function update(id, fields) {
    const affectedRows = await makeDB()
      .update(fields)
      .from("partners")
      .where("id", id);

    if (!affectedRows) {
      throw notFound;
    }
  }

  async function all() {
    return await makeDB()
      .select()
      .from("partners");
  }

  return {
    findByID,
    update,
    create,
    all
  };
};

module.exports = makeService;
