const { notFound } = require("./errors");

const makeService = function(makeDB) {
  async function update(id, data) {
    const affectedRows = await makeDB()
      .update(data)
      .from("citizenships")
      .where("id", id);

    if (!affectedRows) {
      throw notFound;
    }
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
      .then(result => result[0]);
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
