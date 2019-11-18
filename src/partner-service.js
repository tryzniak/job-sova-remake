const R = require("ramda");

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
      throw new Error("Record not found");
    }

    return record;
  }

  async function update(id, fields) {
    return await makeDB("partners")
      .update()
      .values(fields)
      .where("id", id);
  }

  return {
    findByID,
    update,
    create
  };
};

module.exports = makeService;
