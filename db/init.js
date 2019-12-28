//const makeDB = require("../src/makeDB")
//

// specify your own connection details
const knex = require("knex")({
  client: "mysql2",
  connection: {
    user: "root",
    host: "127.0.0.1",
    port: "3306",
    database: "jobsova",
    password: "qwerty"
  }
});

const { hash } = require("argon2");

const adminEmail = "admin@admin.org";
const adminPassword = "1234567890";

async function init() {
  const passwordHash = await hash(adminPassword);
  return knex()
    .insert({
      email: adminEmail,
      passwordHash,
      role: "admin",
      confirmedEmail: true,
      phone: "+375333366777"
    })
    .into("users");
}

init()
  .then(() => console.log("ok. you can close it"))
  .catch(e => console.error(e));
