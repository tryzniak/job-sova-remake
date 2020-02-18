// specify your own connection details
const knex = require("knex")({
  client: "mysql2",
  connection: {
    user: "root",
    //host: "db",
    host: "localhost",
    port: 3306,
    database: "jobsova",
    password: "qwerty"
  }
});

const { hash } = require("argon2");

const adminEmail = "admin@admin.org";
const adminPassword = "1234567890";

async function init() {
  console.log("Seeding database...");
  console.log(`admin login emails is ${adminEmail}`);
  console.log(`admin password is ${adminPassword}`);

  const passwordHash = await hash(adminPassword);

  await knex()
    .insert({
      email: adminEmail,
      passwordHash,
      role: "admin",
      confirmedEmail: true,
      phone: "+375333366777"
    })
    .into("users");

  const disabilityTypes = [
    {
      title: "Общее заболевание"
    },
    {
      title: "Нарушение слуха"
    },
    {
      title: "Заболевание опорно-двигательного аппарата"
    },
    {
      title: "Психические расстройства"
    },
    {
      title: "Нарушение зрения"
    }
  ];

  await Promise.all(
    disabilityTypes.map(d => {
      return knex()
        .insert(d)
        .into("disabilityTypes");
    })
  );

  const disabilityGroups = [
    {
      title: "1-я группа"
    },
    {
      title: "2-я группа"
    },
    {
      title: "3-я группа"
    }
  ];

  await Promise.all(
    disabilityGroups.map(d => {
      return knex()
        .insert(d)
        .into("disabilityGroups");
    })
  );
  const courses = [
    {
      title: "Курс 1",
      about: "Описание 1"
    },
    { title: "Курс 2", about: "Описание 2" }
  ];

  await Promise.all(
    courses.map(d => {
      return knex()
        .insert(d)
        .into("courses");
    })
  );

  const educations = [
    {
      title: "Базовое образование"
    },
    {
      title: "Среднее образование"
    },
    {
      title: "Высшее образование"
    },
    {
      title: "Профессионально-техническое"
    },
    {
      title: "Среднее специальное"
    }
  ];

  await Promise.all(
    educations.map(d => {
      return knex()
        .insert(d)
        .into("educations");
    })
  );

  const partners = [
    { title: "Партнер 1", email: "email1@email.com" },
    { title: "Партнер 2", email: "email2@email.com" }
  ];

  await Promise.all(
    partners.map(d => {
      return knex()
        .insert(d)
        .into("partners");
    })
  );

  const citizenships = [
    {
      title: "Белорусское"
    },
    {
      title: "Российское"
    },
    {
      title: "Украинское"
    },
    {
      title: "Другое"
    }
  ];

  await Promise.all(
    citizenships.map(d => {
      return knex()
        .insert(d)
        .into("citizenships");
    })
  );
}

init()
  .then(() => console.log("Ok. Seed's went through. You can close it"))
  .then(process.exit)
  .catch(console.error);
