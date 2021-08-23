const knex = require("../db/connection");

const TABLE = "reservations";

function list(reservation_date) {
  return knex(`${TABLE}`)
    .select("*")
    .where({ reservation_date })
    .orderBy("reservation_time");
}

function read(reservation_id) {
  return knex(`${TABLE}`).select("*").where({ reservation_id }).first();
}

function create(reservation) {
  return knex(`${TABLE}`)
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function update(updatedReservation) {
  return knex(`${TABLE}`)
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = { list, read, create, update };
