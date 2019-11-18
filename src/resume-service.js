const R = require("ramda");

const makeService = function(makeDB) {
  function unflatten(rows) {
    return R.values(
      R.map(
        flatValues =>
          R.reduce(
            (accObj, value) => {
              return {
                id: value.id,
                title: value.title,
                jobSeekerId: value.jobSeekerId,
                about: value.about,
                hasExperience: Boolean(value.hasExperience),
                isRemoteOnly: Boolean(value.isRemoteOnly),
                needsAccessibility: Boolean(value.needsAccessibility),
                residence: value.residence,
                createdAt: value.createdAt,
                updatedAt: value.updatedAt,
                disabilityTypeId: value.disabilityTypeId,
                disabilityGroupId: value.disabilityGroupId,
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
                ),
                professions: R.uniqBy(R.prop("id"), [
                  ...(accObj.professions || []),
                  { id: value.professionId, title: value.professionTitle }
                ])
              };
            },
            {},
            flatValues
          ),
        R.groupBy(row => row.id)(rows)
      )
    );
  }

  async function update(id, data) {
    const trx = await makeDB().transaction();
    try {
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

      if (data.professions) {
        await trx("resumeProfessions")
          .delete()
          .where("resumeId", id);

        await trx.raw(
          trx("professions")
            .insert(data.professions.map(profession => ({ title: profession })))
            .toString()
            .replace("insert", "INSERT IGNORE")
        );

        await trx.raw(
          "insert into resumeProfessions (resumeId, professionId) select ?, id from professions where title in (?)",
          [id, data.professions]
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
        "r.*",
        "professions.title as professionTitle",
        "professions.id as professionId",
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
      .from(
        makeDB()
          .select()
          .from("resumes")
          .join("jobSeekers", "jobSeekers.userId", "resumes.jobSeekerId")
          .as("r")
          .where(builder => {
            if (predicate.ageMax && predicate.ageMin) {
              builder.whereRaw(
                "TIMESTAMPDIFF(YEAR, dateOfBirth, NOW()) >= ? AND TIMESTAMPDIFF(YEAR, dateOfBirth, NOW()) <= ?",
                [predicate.ageMin, predicate.ageMax]
              );
            }

            builder.where(
              R.omit(
                [
                  "experiences",
                  "skills",
                  "educations",
                  "professions",
                  "pagination",
                  "ageMin",
                  "ageMax"
                ],
                predicate
              )
            );
          })
          .limit(predicate.pagination.perPage)
          .offset(predicate.pagination.pageNumber)
      )
      .leftJoin("resumeEducations", "resumeEducations.resumeId", "r.id")
      .leftJoin("educations", "educations.id", "resumeEducations.educationId")
      .join("resumeProfessions", "resumeProfessions.resumeId", "r.id")
      .join("professions", "professions.id", "resumeProfessions.professionId")
      .join("resumeSkills", "resumeSkills.resumeId", "r.id")
      .join("skills", "skills.id", "resumeSkills.skillId")
      .leftJoin("resumeExperiences", "resumeExperiences.resumeId", "r.id")
      .where(builder => {
        if (!R.isEmpty(predicate.skills || [])) {
          builder.whereIn("skills.title", predicate.skills);
        }

        if (!R.isEmpty(predicate.educations || [])) {
          builder.whereIn("educations.id", predicate.educations);
        }

        if (!R.isEmpty(predicate.professions || [])) {
          builder.whereIn("professions.title", predicate.professions);
        }

        return builder;
      })
      .then(unflatten);
  }
  async function clear() {
    return makeDB()
      .delete()
      .into("resumes");
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

      await trx("resumes")
        .delete()
        .where("id", id);

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function create(data) {
    const trx = await makeDB().transaction();
    try {
      const { educations, professions, skills, experiences, ...resume } = data;
      const [resumeId] = await trx("resumes").insert(resume);
      await trx.raw(
        trx("skills")
          .insert(skills.map(skill => ({ title: skill })))
          .toString()
          .replace("insert", "INSERT IGNORE")
      );

      await trx.raw(
        trx("professions")
          .insert(professions.map(profession => ({ title: profession })))
          .toString()
          .replace("insert", "INSERT IGNORE")
      );

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
        "insert into resumeProfessions (resumeId, professionId) select ?, id from professions where title in (?)",
        [resumeId, professions]
      );

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
        "professions.title as professionTitle",
        "professions.id as professionId",
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
      .join("resumeProfessions", "resumeProfessions.resumeId", "resumes.id")
      .join("professions", "professions.id", "resumeProfessions.professionId")
      .join("resumeSkills", "resumeSkills.resumeId", "resumes.id")
      .join("skills", "skills.id", "resumeSkills.skillId")
      .leftJoin("resumeExperiences", "resumeExperiences.resumeId", "resumes.id")
      .then(
        R.compose(
          R.nth(0),
          unflatten
        )
      );

    if (!record) {
      throw new Error("Record not found");
    }

    return record;
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
