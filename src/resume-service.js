const R = require("ramda");
const { notFound, notUnique } = require("./errors");

const makeService = function(makeDB) {
  function unflatten(rows) {
    return R.values(
      R.map(
        flatValues =>
          R.reduce(
            (accObj, value) => {
              return {
                id: value.id,
                firstName: value.firstName,
                lastName: value.lastName,
                patronymicName: value.patronymicName,
                dateOfBirth: value.dateOfBirth,
                phone: value.phone,
                email: value.email,
                communicationMeans: value.communicationMeans,
                title: value.title,
                jobSeekerId: value.jobSeekerId,
                about: value.about,
                isRemoteOnly: Boolean(value.isRemoteOnly),
                moderationStatus: value.moderationStatus,
                needsAccessibility: Boolean(value.needsAccessibility),
                residence: value.residence,
                createdAt: value.createdAt,
                updatedAt: value.updatedAt,
                disabilityTypeId: value.disabilityTypeId,
                disabilityGroupId: value.disabilityGroupId,
                citizenshipId: value.citizenshipId,
                skills: R.uniqBy(R.prop("id"), [
                  ...(accObj.skills || []),
                  { id: value.skillId, title: value.skillTitle }
                ]),
                educations: R.filter(
                  R.identity,
                  R.uniqBy(R.prop("id"), [
                    ...(accObj.educations || []),
                    value.educationId
                      ? {
                          educationId: value.educationId,
                          specialty: value.educationSpecialty,
                          institutionTitle: value.institutionTitle,
                          endingOn: value.educationEndingOn
                        }
                      : undefined
                  ])
                ),
                experiences: R.filter(
                  R.identity,
                  R.uniqBy(R.prop("id"), [
                    ...(accObj.experiences || []),
                    value.employerTitle
                      ? {
                          positionTitle: value.experiencePosition,
                          employerTitle: value.employerTitle,
                          endingOn: value.experienceEndingOn,
                          startingOn: value.experienceStartingOn
                        }
                      : undefined
                  ])
                )
              };
            },
            {},
            flatValues
          ),
        R.groupBy(row => row.id)(rows)
      )
    );
  }

  async function updateForJobSeeker(jobSeekerId, id, data) {
    const trx = await makeDB().transaction();
    try {
      const record = await trx("resumes")
        .where({ jobSeekerId, id })
        .first();
      if (!record) {
        throw notFound;
      }

      if (data.skills) {
        await trx.raw(
          trx("skills")
            .insert(data.skills.map(title => ({ title })))
            .toString()
            .replace("insert", "insert ignore")
        );

        await trx("resumeSkills")
          .delete()
          .where("resumeId", id);

        await trx.raw(
          "insert into resumeSkills (resumeId, skillId) select ?, id from skills where title in (?)",
          [id, data.skills]
        );
      }

      if (data.experiences) {
        await trx("resumeExperiences")
          .delete()
          .where("resumeId", id);

        await trx("resumeExperiences").insert(
          data.experiences.map(experience => ({ ...experience, resumeId: id }))
        );
      }

      if (data.educations) {
        await trx("resumeEducations")
          .delete()
          .where("resumeId", id);

        await trx("resumeEducations").insert(
          data.educations.map(education => ({ ...education, resumeId: id }))
        );
      }

      const restUpdateData = R.omit(
        ["educations", "skills", "experiences", "professions"],
        data
      );

      if (!R.isEmpty(restUpdateData)) {
        const affectedRows = await trx()
          .update({ ...restUpdateData, jobSeekerId })
          .from("resumes")
          .where("id", id);
      }

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }
  async function update(id, data) {
    const trx = await makeDB().transaction();
    try {
      const record = await trx("vacancies")
        .where({ id })
        .first();
      if (!record) {
        throw notFound;
      }
      if (data.skills) {
        await trx.raw(
          trx("skills")
            .insert(data.skills.map(title => ({ title })))
            .toString()
            .replace("insert", "insert ignore")
        );

        await trx("resumeSkills")
          .delete()
          .where("resumeId", id);

        await trx.raw(
          "insert into resumeSkills (resumeId, skillId) select ?, id from skills where title in (?)",
          [id, data.skills]
        );
      }

      if (data.experiences) {
        await trx("resumeExperiences")
          .delete()
          .where("resumeId", id);

        await trx("resumeExperiences").insert(
          data.experiences.map(experience => ({ ...experience, resumeId: id }))
        );
      }

      if (data.educations) {
        await trx("resumeEducations")
          .delete()
          .where("resumeId", id);

        await trx("resumeEducations").insert(
          data.educations.map(education => ({ ...education, resumeId: id }))
        );
      }

      const restUpdateData = R.omit(
        ["educations", "skills", "experiences", "professions"],
        data
      );

      if (!R.isEmpty(restUpdateData)) {
        await trx()
          .update(restUpdateData)
          .from("resumes")
          .where("id", id);
      }

      if (data.moderationStatus) {
        await trx()
          .update({ moderationStatus: data.moderationStatus })
          .from("skills")
          .join("resumeSkills", "resumeSkills.skillId", "skills.id")
          .where("resumeSkills.resumeId", id);
      }

      await trx.commit();
      return id;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function all(predicate) {
    return makeDB()
      .select([
        "resumes.*",
        "skills.title as skillTitle",
        "skills.id as skillId",
        "resumeEducations.id as educationId",
        "resumeEducations.institutionTitle as institutionTitle",
        "resumeEducations.endingOn as educationEndingOn",
        "resumeEducations.specialty as educationSpecialty",
        "resumeExperiences.positionTitle as experiencePosition",
        "resumeExperiences.startingOn as experienceStartingOn",
        "resumeExperiences.endingOn as experienceEndingOn",
        "resumeExperiences.employerTitle as employerTitle"
      ])
      .from("resumes")
      .leftJoin("resumeEducations", "resumeEducations.resumeId", "resumes.id")
      .join("resumeSkills", "resumeSkills.resumeId", "resumes.id")
      .join("skills", "skills.id", "resumeSkills.skillId")
      .leftJoin("resumeExperiences", "resumeExperiences.resumeId", "resumes.id")
      .where(builder => {
        if (!R.isEmpty(predicate.skills || [])) {
          builder.whereIn("skills.id", predicate.skills);
        }

        if (!R.isEmpty(predicate.educations || [])) {
          builder.whereIn("educations.id", predicate.educations);
        }

        if (!R.isEmpty(predicate.specialties || [])) {
          builder.whereIn("resumeEducations.specialty", predicate.specialties);
        }

        if (predicate.paginationState) {
          builder.where("resumes.id", "<", predicate.paginationState);
        }

        if (predicate.moderationStatus) {
          builder.where("resumes.moderationStatus", predicate.moderationStatus);
          builder.where("skills.moderationStatus", predicate.moderationStatus);
        }

        if (predicate.jobSeekerId) {
          builder.where("jobSeekerId", predicate.jobSeekerId);
        }
        return builder;
      })
      .orderBy("id", "desc")
      .limit(50)
      .then(unflatten);
  }

  async function removeForJobSeeker(jobSeekerId, id) {
    const trx = await makeDB().transaction();
    try {
      await trx("resumeExperiences")
        .delete()
        .where("resumeId", id);

      await trx("resumeSkills")
        .delete()
        .where("resumeId", id);

      await trx("resumeEducations")
        .delete()
        .where("resumeId", id);

      await trx("resumeProfessions")
        .delete()
        .where("resumeId", id);

      const rowsAffected = await trx("resumes")
        .delete()
        .where({ id, jobSeekerId });
      if (rowsAffected > 1) {
        throw notUnique;
      }

      if (rowsAffected === 0) {
        throw notFound;
      }

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }
  async function remove(id) {
    const trx = await makeDB().transaction();
    try {
      await trx("resumeExperiences")
        .delete()
        .where("resumeId", id);

      await trx("resumeSkills")
        .delete()
        .where("resumeId", id);

      await trx("resumeEducations")
        .delete()
        .where("resumeId", id);

      await trx("resumeProfessions")
        .delete()
        .where("resumeId", id);

      const rowsAffected = await trx("resumes")
        .delete()
        .where("id", id);
      if (rowsAffected > 1) {
        const err = new Error("Record not unique");
        err.code = "DB_NOT_UNIQUE";
        throw err;
      }

      if (rowsAffected === 0) {
        const err = new Error("Record not found");
        err.code = "DB_NOT_FOUND";
        throw err;
      }

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function create(data) {
    // refactoring:
    // use Promise.all where it's possible
    const trx = await makeDB().transaction();
    try {
      const { educations, skills, experiences, location, ...resume } = data;
      await trx.raw(
        trx("skills")
          .insert(skills.map(skill => ({ title: skill })))
          .toString()
          .replace("insert", "INSERT IGNORE")
      );

      const [markerId] = await trx("markers").insert(location);

      const [resumeId] = await trx("resumes").insert({ ...resume, markerId });

      await trx.raw(
        "insert into resumeSkills (resumeId, skillId) select ?, id from skills where title in (?)",
        [resumeId, skills]
      );

      if (experiences && experiences.length) {
        await trx("resumeExperiences").insert(
          experiences.map(item => Object.assign({}, item, { resumeId }))
        );
      }

      await trx.raw(
        trx("resumeEducations")
          .insert(
            educations.map(educationInfo => ({ ...educationInfo, resumeId }))
          )
          .toString()
      );
      await trx.commit();
      return resumeId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function findByID(id) {
    const record = await makeDB()
      .select([
        "resumes.*",
        "skills.title as skillTitle",
        "skills.id as skillId",
        "educations.title as educationTitle",
        "educations.id as educationId",
        "resumeEducations.institutionTitle as institutionTitle",
        "resumeEducations.endingOn as educationEndingOn",
        "resumeEducations.specialty as educationSpecialty",
        "resumeExperiences.positionTitle as experiencePosition",
        "resumeExperiences.startingOn as experienceStartingOn",
        "resumeExperiences.endingOn as experienceEndingOn",
        "resumeExperiences.employerTitle as employerTitle"
      ])
      .from("resumes")
      .leftJoin("resumeEducations", "resumeEducations.resumeId", "resumes.id")
      .leftJoin("educations", "educations.id", "resumeEducations.educationId")
      .join("resumeSkills", "resumeSkills.resumeId", "resumes.id")
      .join("skills", "skills.id", "resumeSkills.skillId")
      .leftJoin("resumeExperiences", "resumeExperiences.resumeId", "resumes.id")
      .where("resumes.id", id)
      .then(
        R.compose(
          R.nth(0),
          unflatten
        )
      );

    if (!record) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }

    return record;
  }

  return {
    create,
    remove,
    removeForJobSeeker,
    update,
    all,
    findByID
  };
};

module.exports = makeService;
