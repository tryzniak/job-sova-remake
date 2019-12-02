module.exports = makeDB => {
  async function all(moderationStatus) {
    return makeDB()
      .distinct(["resumeEducations.specialty"])
      .from("resumes")
      .join("resumeEducations", "resumeEducations.resumeId", "resumes.id")
      .where("moderationStatus", moderationStatus);
  }

  async function findByID(id, moderationStatus) {
    const record = await makeDB()
      .distinct(["resumeEducations.specialty", "resumeEducations.id"])
      .from("resumes")
      .join("resumeEducations", "resumeEducations.resumeId", "resumes.id")
      .where("moderationStatus", moderationStatus)
      .andWhere("resumeEducations.id", id)
      .first();
    if (!record) {
      const err = new Error("Record not found");
      throw err;
    }

    return record;
  }

  return {
    all,
    findByID
  };
};
