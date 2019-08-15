const makeService = function(makeDB) {
  async function create({ jobSeekerId, resumeId, vacancyId }) {
    return makeDB()
      .raw(
        "insert into applications (resumeId, vacancyId) select id, ? from resumes where id = ? and jobSeekerId = ?",
        [vacancyId, resumeId, jobSeekerId]
      )
      .then(result => result[0].insertId);
  }

  async function findByID(id) {
    const record = await makeDB()
      .select()
      .from("applications")
      .where("id", id)
      .first();
    if (!record) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...skill };
  }

  return {
    create,
    findByID
  };
};

module.exports = makeService;
