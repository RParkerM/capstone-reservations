const knex = require("../db/connection");

const TABLE = "tables";

function list() {
  return knex(`${TABLE}`).select("*").orderBy("table_name");
}

function read(table_id) {
  console.log("reading in service");
  return knex(`${TABLE}`).select("*").where({ table_id }).first();
}

function create(table) {
  return knex(`${TABLE}`)
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = { list, read, create };
