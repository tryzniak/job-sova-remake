const makeService = function(makeDB) {
  async function createWithResume(user, { resumeId, vacancyId }) {
    const trx = await makeDB().transaction();
    try {
      const promiseJobSeekerId = makeDB()
        .select(["jobSeekerId"])
        .from("resumes")
        .first()
        .where({ id: resumeId, moderationStatus: "OK" });
      const promiseEmployerId = makeDB()
        .select(["employerId"])
        .from("vacancies")
        .first()
        .where({ id: vacancyId, moderationStatus: "OK" });

      const [resultEmployerId, resultJobSeekerId] = await Promise.all([
        promiseEmployerId,
        promiseJobSeekerId
      ]);

      if (!resultJobSeekerId) {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      if (!resultEmployerId) {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      if (user.role === "employer" && user.id !== resultEmployerId.employerId) {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      if (
        user.role === "jobseeker" &&
        user.id !== resultJobSeekerId.jobSeekerId
      ) {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      const [applicationId] = await trx()
        .insert({
          resumeId,
          vacancyId,
          employerId: resultEmployerId.employerId,
          jobSeekerId: resultJobSeekerId.jobSeekerId
        })
        .into("applications");

      await trx.commit();
      return applicationId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function createWithoutResume(
    user,
    { jobSeekerId, vacancyId, jobSeekerContacts }
  ) {
    const trx = await makeDB().transaction();
    try {
      const resultEmployerId = await makeDB()
        .select(["employerId"])
        .from("vacancies")
        .first()
        .where({ id: vacancyId, moderationStatus: "OK" });

      if (!resultEmployerId) {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      if (user.role === "employer") {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      if (user.role === "jobseeker" && user.id !== jobSeekerId) {
        const err = new Error("Record not found");
        err.code = "ER_NOT_FOUND";
        throw err;
      }

      const [applicationId] = await trx()
        .insert({
          vacancyId,
          employerId: resultEmployerId.employerId,
          jobSeekerId,
          jobSeekerContacts
        })
        .into("applications");

      await trx.commit();
      return applicationId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function messages(applicationId) {
    const result = await makeDB()
      .select()
      .from("chatMessages")
      .where("applicationId", applicationId);
    return result;
  }

  async function sendMessage(data) {
    const [id] = await makeDB()
      .insert(data)
      .into("chatMessages");
    return id;
  }

  async function removeMessage({ messageId, userId }) {
    const affectedRows = await makeDB()
      .delete()
      .from("chatMessages")
      .where({ id: messageId, fromUserId: userId });
    if (!affectedRows) {
      const err = new Error("Record not found");
      err.code = "ER_NOT_FOUND";
      throw err;
    }
  }

  async function findMessageByID(id) {
    const record = await makeDB()
      .select()
      .from("chatMessages")
      .where("id", id)
      .first();
    if (!record) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...record };
  }

  async function where(filter) {
    return makeDB()
      .select()
      .from("applications")
      .where(fitler);
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
    return { ...record };
  }

  return {
    createWithResume,
    createWithoutResume,
    findByID,
    messages,
    findMessageByID,
    sendMessage,
    removeMessage,
    where
  };
};

module.exports = makeService;
