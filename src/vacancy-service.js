const R = require("ramda");
const ModerationStatus = require("./moderation-status");

function unflatten(rows) {
  return R.values(
    R.map(
      flatValues =>
        R.reduce(
          (accObj, value) => {
            return R.filter(R.identity, {
              id: value.id,
              title: value.title,
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
  async function update(id, data) {
    const trx = await makeDB().transaction();
    try {
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

      await trx.commit();
      return id;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async function all(predicate = { moderationStatus: ModerationStatus.OK }) {
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

            builder.where(
              R.omit(
                ["pagination", "nearby", "skills", "minSalary", "maxSalary"],
                predicate
              )
            );
          })
          .limit(predicate.pagination.perPage)
          .offset(predicate.pagination.pageNumber)
      )
      .join("markers", "markers.id", "v.markerId")
      .leftJoin("vacancySkills", "vacancySkills.vacancyId", "v.id")
      .leftJoin("skills", "skills.id", "vacancySkills.skillId")
      .where(builder => {
        if (!R.isEmpty(predicate.skills || [])) {
          builder.whereIn("skills.title", predicate.skills);
        }
      })
      .then(unflatten);
  }

  async function clear() {
    return makeDB()
      .delete()
      .into("vacancies");
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
    const vacancy = await makeDB()
      .select()
      .from("vacancies")
      .where("id", id)
      .first();
    if (!vacancy) {
      const e = new Error("Record not found");
      e.code = "ER_NOT_FOUND";
      throw e;
    }
    return { ...vacancy };
  }

  return {
    create,
    clear,
    remove,
    update,
    all,
    nearby,
    findByID
  };
};

module.exports = makeService;
