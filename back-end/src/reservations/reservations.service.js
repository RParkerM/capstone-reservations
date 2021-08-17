const knex = require("../db/connection");

const TABLE = "reservations";

function list(reservation_date) {
  return knex(`${TABLE}`).select("*").where({ reservation_date });
}

module.exports = { list };
