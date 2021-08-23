const knex = require("../db/connection");

const TABLE = "tables";
const RES_TABLE = "reservations";

function list() {
  return knex(`${TABLE}`).select("*").orderBy("table_name");
}

function read(table_id) {
  // console.log("reading in service");
  return knex(`${TABLE}`).select("*").where({ table_id }).first();
}

function create(table) {
  return knex(`${TABLE}`)
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function update(updatedTable) {
  return knex(`${TABLE}`)
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

function finish(table_id) {
  return knex(`${TABLE}`)
    .select("*")
    .where({ table_id })
    .update({ reservation_id: null }, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

function modifyReservationStatus(reservation_id, status) {
  return knex(`${RES_TABLE}`)
    .select("*")
    .where({ reservation_id })
    .update({ status }, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
  list,
  read,
  create,
  update,
  finish,
  modifyReservationStatus,
};
