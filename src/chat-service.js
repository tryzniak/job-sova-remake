module.exports = makeDB => {
  async function findWhere(fields) {
    const result = await makeDB()
      .select()
      .from("applications")
      .first()
      .where(fields);
    if (!result) {
      const err = new Error("Record not found");
      err.code = "ER_NOT_FOUND";
      throw err;
    }

    return result;
  }

  async function roomParticipantsEmails(applicationId) {
    return makeDB()
      .select(["u1.email as jobSeekerEmail", "u2.email as employerEmail"])
      .from("applications")
      .join("jobSeekers", "jobSeekers.userId", "applications.jobSeekerId")
      .join("users as u1", "u1.id", "jobSeekers.userId")
      .join("employers", "employers.userId", "applications.employerId")
      .join("users as u2", "u2.id", "employers.userId")
      .where("applications.id", applicationId)
      .first()
      .then(Object.values);
  }

  async function findRooms(userId) {
    const results = await makeDB()
      .select(["applications.id"])
      .from("applications")
      .join("vacancies", "vacancies.id", "applications.vacancyId")
      .leftJoin("resumes", "resumes.id", "applications.resumeId")
      .where("applications.jobSeekerId", userId)
      .orWhere("vacancies.employerId", userId)
      .orWhere("resumes.jobSeekerId", userId);
    return results;
  }

  async function saveMessage(fields) {
    const [messageId] = await makeDB()
      .insert(fields)
      .into("chatMessages");
  }

  async function findMessage(user, messageId) {
    const record = await makeDB()
      .select(["chatMessages.*"])
      .from("chatMessages")
      .join("applications", "applications.id", "chatMessages.applicationId")
      .first()
      .where(builder => {
        if (user.role === "employer") {
          builder.where("employerId", user.id);
        }

        if (user.role === "jobseeker") {
          builder.where("jobSeekerId", user.id);
        }

        builder.where("chatMessages.id", messageId);
      });

    if (!record) {
      const err = new Error("Record not found");
      err.code = "ER_NOT_FOUND";
      throw err;
    }

    return record;
  }

  async function findUserMessages(user) {
    return makeDB()
      .select(["chatMessages.*"])
      .from("chatMessages")
      .join("applications", "applications.id", "chatMessages.applicationId")
      .where(builder => {
        if (user.role === "employer") {
          builder.where("employerId", user.id);
        }

        if (user.role === "jobseeker") {
          builder.where("jobSeekerId", user.id);
        }
      });
  }
  return {
    findWhere,
    findRooms,
    saveMessage,
    roomParticipantsEmails,
    findMessage,
    findUserMessages
  };
};
