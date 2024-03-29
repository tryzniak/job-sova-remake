const R = require("ramda");
const ModerationStatus = require("./moderation-status");
const { notUnique, notFound } = require("./errors");

function unflatten(rows) {
  return R.values(
    R.map(
      flatValues =>
        R.reduce(
          (accObj, value) => {
            return R.filter(R.identity, {
              id: value.id,
              title: value.title,
              moderationStatus: value.moderationStatus,
              employerId: value.employerId,
              about: value.about,
              isActive: Boolean(value.isActive),
              isAccessible: Boolean(value.isAccessible),
              isRemoteOk: Boolean(value.isRemoteOk),
              hasTrainingOrCourse: Boolean(value.hasTrainingOrCourse),
              experienceIsRequired: Boolean(value.experienceIsRequired),
              parTime: Boolean(value.parTime),
              contacts: value.contacts,
              responsibilites: value.responsibilities,
              salaryBYR: value.salaryBYR,
              location: {
                lat: value.lat,
                lng: value.lng,
                address: value.address
              },
              skills: R.filter(
                R.identity,
                (R.prop("id"),
                [
                  ...(accObj.skills || []),
                  value.skillId
                    ? { id: value.skillId, title: value.skillTitle }
                    : undefined
                ])
              ),
              disabilityGroupId: value.disabilityGroupId,
              disabilityTypeId: value.disabilityTypeId,
              createdAt: value.createdAt,
              updatedAt: value.updatedAt
            });
          },
          {},
          flatValues
        ),
      R.groupBy(row => row.id)(rows)
    )
  );
}
const makeService = function(makeDB) {
  async function updateForEmployer(employerId, id, data) {
    // todo deduplicate
    const trx = await makeDB().transaction();
    try {
      const record = await trx("vacancies")
        .where({ id, employerId })
        .first();
      if (!record) {
        throw notFound;
      }

      if (data.skills) {
        await trx("vacancySkills")
          .delete()
          .where("vacancyId", id);
        await trx.raw(
          trx("skills")
            .insert(data.skills.map(title => ({ title })))
            .toString()
            .replace("insert", "insert ignore")
        );

        if (data.skills.length) {
          await trx.raw(
            "insert into vacancySkills (vacancyId, skillId) select ?, id from skills where title in (?)",
            [id, data.skills]
          );
        }
      }

      if (data.location) {
        const [markerId] = await trx("markers").insert(data.location);
        await trx("vacancies")
          .update({ markerId })
          .where("id", id);
      }

      const restUpdateData = R.omit(["skills", "location"], data);

      if (!R.isEmpty(restUpdateData)) {
        await trx()
          .update(restUpdateData)
          .from("vacancies")
          .where({ id, employerId });
      }

      await trx.commit();
      return id;
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
        await trx("vacancySkills")
          .delete()
          .where("vacancyId", id);
        await trx.raw(
          trx("skills")
            .insert(data.skills.map(title => ({ title })))
            .toString()
            .replace("insert", "insert ignore")
        );

        if (data.skills.length) {
          await trx.raw(
            "insert into vacancySkills (vacancyId, skillId) select ?, id from skills where title in (?)",
            [id, data.skills]
          );
        }
      }

      if (data.location) {
        const [markerId] = await trx("markers").insert(data.location);
        await trx("vacancies")
          .update({ markerId })
          .where("id", id);
      }

      const restUpdateData = R.omit(["skills", "location"], data);

      if (!R.isEmpty(restUpdateData)) {
        await trx()
          .update(restUpdateData)
          .from("vacancies")
          .where("id", id);
      }

      if (data.moderationStatus) {
        await trx()
          .update({ moderationStatus: data.moderationStatus })
          .from("skills")
          .join("vacancySkills", "vacancySkills.skillId", "skills.id")
          .where("vacancySkills.vacancyId", id);
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
        "v.*",
        "markers.lat as lat",
        "markers.lng as lng",
        "markers.address as address",
        "skills.title as skillTitle",
        "skills.id as skillId"
      ])
      .from(
        makeDB()
          .select()
          .from("vacancies")
          .as("v")
          .where(builder => {
            if (R.has("minSalary")(predicate)) {
              builder.where("salaryBYR", ">=", predicate.minSalary);
            }

            if (R.has("maxSalary")(predicate)) {
              builder.andWhere("salaryBYR", "<=", predicate.maxSalary);
            }

            if (!R.isEmpty(predicate.nearby || {})) {
              builder.whereRaw(
                "6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))) < ?",
                [
                  predicate.nearby.lat,
                  predicate.nearby.lng,
                  predicate.nearby.lat,
                  predicate.nearby.radius
                ]
              );
            }

            if (predicate.paginationState) {
              builder.where("vacancies.id", "<", predicate.paginationState);
            }

            builder.where(
              R.omit(
                [
                  "paginationState",
                  "nearby",
                  "skills",
                  "minSalary",
                  "maxSalary"
                ],
                predicate
              )
            );
          })
          .limit(50)
          .orderBy("id", "desc")
      )
      .join("markers", "markers.id", "v.markerId")
      .leftJoin(
        makeDB()
          .select()
          .from("vacancySkills")
          .as("vacancySkillsFiltered"),
        "vacancySkillsFiltered.vacancyId",
        "v.id"
      )
      .leftJoin("skills", "skills.id", "vacancySkillsFiltered.skillId")
      .where(builder => {
        if (!R.isEmpty(predicate.skills || [])) {
          builder.whereIn("skills.title", predicate.skills);
        }
      })
      .then(unflatten);
  }

  async function removeForEmployer(employerId, id) {
    const trx = await makeDB().transaction();
    try {
      await trx()
        .delete()
        .from("vacancySkills")
        .where("vacancyId", id);
      const rowsAffected = await trx()
        .delete()
        .from("vacancies")
        .where({ id, employerId });
      if (rowsAffected !== 1) {
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
      await trx()
        .delete()
        .from("vacancySkills")
        .where("vacancyId", id);
      await trx()
        .delete()
        .from("vacancies")
        .where("id", id);

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function nearby({ lat, lng }, radiusKm) {
    return makeDB()
      .raw(
        "select vacancies.*, lat, lng, address, (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) AS distance from vacancies join markers on vacancies.markerId = markers.id having distance < ?",
        [lat, lng, lat, radiusKm]
      )
      .then(results => unflatten(results[0]));
  }

  async function create(data) {
    const trx = await makeDB().transaction();
    try {
      const { skills, location, ...vacancy } = data;

      await trx.raw(
        trx("skills")
          .insert(skills.map(skill => ({ title: skill })))
          .toString()
          .replace("insert", "INSERT IGNORE")
      );

      const [markerId] = await trx("markers").insert(location);

      const [vacancyId] = await trx("vacancies").insert({
        ...vacancy,
        markerId
      });

      await trx.raw(
        "insert into vacancySkills (vacancyId, skillId) select ?, id from skills where title in (?)",
        [vacancyId, skills]
      );

      await trx.commit();
      return vacancyId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function findByID(id) {
    // todo dedup
    const record = await makeDB()
      .select([
        "vacancies.*",
        "markers.lat as lat",
        "markers.lng as lng",
        "markers.address as address",
        "skills.title as skillTitle",
        "skills.id as skillId"
      ])
      .from("vacancies")
      .join("markers", "markers.id", "vacancies.markerId")
      .leftJoin("vacancySkills", "vacancySkills.vacancyId", "vacancies.id")
      .leftJoin("skills", "skills.id", "vacancySkills.skillId")
      .where("vacancies.id", id)
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
    remove,
    update,
    updateForEmployer,
    removeForEmployer,
    all,
    nearby,
    findByID
  };
};

module.exports = makeService;
