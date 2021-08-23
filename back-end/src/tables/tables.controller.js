const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const {
  reservationExists,
} = require("../reservations/reservations.controller");
const { join } = require("../db/connection");

const VALID_PROPERTIES = ["capacity", "table_name", "reservation_id"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function hasRequiredProperties(req, res, next) {
  const { data } = req.body;
  if (!data)
    return next({
      status: 400,
      message: "Required table data is missing.",
    });
  const { table_name, capacity } = data;
  if (!table_name)
    return next({
      status: 400,
      message: "Required property table_name is missing",
    });
  if (typeof table_name != "string" || table_name.length < 2)
    return next({
      status: 400,
      message:
        "Property table_name must be a string which is at least 2 characters long.",
    });

  if (typeof capacity !== "number" || isNaN(capacity) || !capacity) {
    return next({
      status: 400,
      message:
        "Required property capacity is missing or zero. Must be a number greater than zero.",
    });
  }
  next();
}

function hasRequiredPropertiesForSeating(req, res, next) {
  const { data } = req.body;
  if (!data)
    return next({
      status: 400,
      message: "Required reservation data missing for table. No data provided.",
    });
  const { reservation_id } = data;
  if (!reservation_id)
    return next({
      status: 400,
      message:
        "Required reservation data missing for table. Missing reservation_id.",
    });
  res.locals.reservationId = reservation_id;
  next();
}

function tableHasCapacityAndAvailability(req, res, next) {
  const { capacity, table_name, reservation_id } = res.locals.table;
  const { people } = res.locals.reservation;
  console.log("cap", capacity, "peopl", people, "resoid", reservation_id);
  console.log("table", res.locals.table);
  if (people > capacity)
    return next({
      status: 400,
      message: `Table ${table_name} only has capacity for ${capacity} guests. Requested party size ${people}.`,
    });
  if (reservation_id)
    return next({
      status: 400,
      message: `Table ${table_name} is already occupied.`,
    });
  next();
}

function canSeatReservation(req, res, next) {
  const { status } = res.locals.reservation;
  if (status !== "booked")
    return next({
      status: 400,
      message: `Cannot seat a reservation which is not booked. Status of reservation ${status}`,
    });
  next();
}

async function tableExists(req, res, next) {
  // console.log("tableExists");
  const { tableId } = req.params;
  if (tableId === undefined)
    return next({
      status: 500,
      message: "Internal error. Table id is missing",
    });
  const table = await service.read(tableId);
  // console.log(table);
  if (!table)
    return next({
      status: 404,
      message: `Table not found with id: ${tableId}`,
    });
  res.locals.table = table;
  next();
}

async function create(req, res, next) {
  const { data } = req.body;
  if (!data.reservation_id) data.reservation_id = null;
  console.log(data);
  try {
    const table = await service.create(data);
    res.status(201).json({ data: table });
  } catch (e) {
    next({ status: 500, message: e });
  }
}

function tableIsOccupied(req, res, next) {
  const { reservation_id, table_name } = res.locals.table;
  if (!reservation_id)
    return next({
      status: "400",
      message: `Table ${table_name} is not occupied`,
    });
  next();
}

/**
 * List handler for table resources
 */
async function list(req, res) {
  const data = await service.list(res.locals.date);
  res.status(200).json({ data });
}

async function read(req, res) {
  console.log("read");
  res.json({ data: res.locals.table });
}

async function seat(req, res) {
  const reservation_id = res.locals.reservationId;
  const updatedTable = { ...res.locals.table, reservation_id };
  console.log(updatedTable);
  const data = await service.update(updatedTable);
  const reservation = await service.modifyReservationStatus(
    reservation_id,
    "seated"
  );
  res.status(200).json({ data });
}

async function finishTable(req, res) {
  const { table_id, reservation_id } = res.locals.table;
  const table = await service.finish(table_id);
  console.debug(table);
  const reservation = await service.modifyReservationStatus(
    reservation_id,
    "finished"
  );
  res.status(200).json({ table });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  seat: [
    asyncErrorBoundary(tableExists),
    hasRequiredPropertiesForSeating,
    asyncErrorBoundary(reservationExists),
    canSeatReservation,
    tableHasCapacityAndAvailability,
    asyncErrorBoundary(seat),
  ],
  finishTable: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(finishTable),
  ],
};
