//const makeDB = require("../src/makeDB")
//

// TODO bigint it all!
const knex = require("knex")({
  client: "mysql2",
  connection: {
    user: "root",
    host: "127.0.0.1",
    port: "3366",
    database: "jobsova",
    password: "mypassword"
  }
});

async function init() {
  await knex.raw("SET FOREIGN_KEY_CHECKS=0");
  await knex.schema.dropTableIfExists("taxis");
  await knex.schema.createTable("taxis", function(table) {
    table.increments();
    table.string("title").notNullable();
    table.text("description").notNullable();
    table.string("url").notNullable();
    table
      .integer("distanceTraveled")
      .notNullable()
      .defaultTo(0);
    table.unique("title");
  });

  await knex.schema.dropTableIfExists("partners");
  await knex.schema.createTable("partners", function(table) {
    table.increments();
    table.string("title").notNullable();
    table.text("description").notNullable();
    table.string("url").notNullable();
    table.unique("title");
  });

  /*
  await knex.schema.dropTableIfExists("users");
  await knex.schema.createTable("users", function(table) {
    table.increments();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("patronymic").notNullable();
    table.string("email").notNullable();
    table.string("passwordHash").notNullable();
    table.string("role").notNullable();
    table.string("phoneNumber").notNullable();
    table.unique(["email", "phoneNumber"]);
    table.unique("phoneNumber");
  });
  */

  await knex.schema.dropTableIfExists("trips");
  await knex.schema.createTable("trips", function(table) {
    table.increments();
    table
      .integer("createdBy")
      .unsigned()
      .notNullable();
    table
      .foreign("createdBy")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    //table.string("hash").notNullable();
    table.string("title").notNullable();
    table.text("description").notNullable();
    table.text("originAddress").notNullable();
    table.text("destinationAddress").notNullable();
    table.boolean("roundTrip").notNullable();
    table.dateTime("dateTimeStart").notNullable();
    // can be either of NEEDS_REVIEW, PASSED_REVIEW, TAXI_ASSIGNED, TRIP_OVER
    table
      .string("status")
      .notNullable()
      .defaultTo("NEEDS_REVIEW");
  });

  await knex.schema.dropTableIfExists("vouchers");
  await knex.schema.createTable("vouchers", function(table) {
    table.increments();
    table.string("title").notNullable();
    table.text("description").notNullable();
    table.text("instructions").notNullable();
    table
      .integer("price")
      .unsigned()
      .notNullable();
    table
      .integer("partnerId")
      .unsigned()
      .notNullable();
    table
      .foreign("partnerId")
      .references("id")
      .inTable("partners")
      .onDelete("CASCADE");
    table.unique(["title", "partnerId"]);
  });

  await knex.schema.dropTableIfExists("voucherCodes");
  await knex.schema.createTable("voucherCodes", function(table) {
    table.increments();
    table.string("code").notNullable();
    table
      .integer("voucherId")
      .unsigned()
      .notNullable();
    table
      .foreign("voucherId")
      .references("id")
      .inTable("vouchers")
      .onDelete("CASCADE");
    table.unique(["code", "voucherId"]);
  });

  await knex.schema.dropTableIfExists("claimedVouchers");
  await knex.schema
    .withSchema("kilometry")
    .createTable("claimedVouchers", function(table) {
      table.increments();
      table
        .integer("donorId")
        .unsigned()
        .notNullable();
      table
        .integer("voucherId")
        .unsigned()
        .notNullable();
      table
        .foreign("voucherId")
        .references("id")
        .inTable("vouchers")
        .onDelete("CASCADE");
      table
        .foreign("donorId")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .boolean("isActive")
        .notNullable()
        .defaultTo(true);
      table.unique(["donorID", "voucherID"]);
    });

  await knex.schema.dropTableIfExists("accounts");
  await knex.schema
    .withSchema("kilometry")
    .createTable("accounts", function(table) {
      table.increments();
      table
        .integer("userID")
        .unsigned()
        .notNullable();
      table
        .foreign("userID")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .bigInteger("balance")
        .unsigned()
        .notNullable()
        .defaultTo(0);
    });
  await knex.raw("SET FOREIGN_KEY_CHECKS=1");
}

init()
  .then(() => console.log("ok"))
  .catch(e => console.error(e));
