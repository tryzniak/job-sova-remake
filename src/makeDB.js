const knex = require("knex");
const mem = require("mem");

module.exports = mem(() =>
  knex({
    client: "mysql2",
    connection: {
      user: "root",
      //host: "db",
      host: process.env.DB_HOST,
      port: 3306,
      database: "jobsova",
      password: "qwerty"
    }
  })
);
