const knex = require("../db/connection");

const TABLE = "reservations";

function list(reservation_date) {
  return knex(`${TABLE}`).select("*").where({ reservation_date });
}

function read(reservation_id) {
  return knex(`${TABLE}`).select("*").where({ reservation_id }).first();
}

function create(reservation) {
  return knex(`${TABLE}`)
    .insert(reservation)
    .then((createdRecords) => createdRecords[0]);
}

module.exports = { list, read, create };
