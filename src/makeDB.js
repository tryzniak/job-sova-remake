const knex = require("knex");
const mem = require("mem");

module.exports = mem(() =>
  knex({
    client: "mysql2",
    connection: {
      user: "root",
      host: "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      database: "jobsova",
      password: "qwerty"
    }
  })
);
