const knex = require("knex");
const mem = require("mem");

module.exports = mem(() =>
  knex({
    client: "mysql2",
    connection: {
      user: "root",
      host: "db",
      port: 3306,
      database: "jobsova",
      password: "qwerty"
    }
  })
);
