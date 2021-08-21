const reservations = require("./00-reservations.json");

exports.seed = function (knex) {
  // console.log(knex.client.config);
  try {
    return knex
      .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
      .then(() => {
        console.log("woohoo im inserting resos");
        return knex("reservations").insert(reservations);
      });
  } catch (err) {
    console.log(err);
  }
};
