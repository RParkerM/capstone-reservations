const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const {
  isYYYYMMDD,
  hasValidDateForReserving,
  hasValidPropertiesForReserving,
} = require("../utils/validation");
const getToday = require("../utils/time").getTodayYYYYMMdd;

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
];

/**
 * Express function that ensures `req.body.data` only includes properties defined in the `VALID_PROPERTIES` constant.
 *
 * Calls the express error handler if `req.body.data` includes a property not defined in `VALID_PROPERTIES`
 */
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

/**
 * Express function that ensures `req.body.data` has valid properties for updating.
 * If not, it will call the express error handler with validation issues.
 */
function hasValidPropertiesForUpdating(req, res, next) {
  const updatedReservation = { ...req.body.data };

  //The next 3 lines delete reservation_id, created_at, and updated_at
  //These 3 lines are included from the Postgres DB rows, however we do not want
  // to update them, even if they are included in the PUT request.
  delete updatedReservation.reservation_id;
  delete updatedReservation.created_at;
  delete updatedReservation.updated_at;
  const invalidFields = Object.keys(updatedReservation).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  const validatedReservation =
    hasValidPropertiesForReserving(updatedReservation);
  if (!validatedReservation.isValid)
    return next({
      status: 400,
      message: validatedReservation.message,
    });
  res.locals.reservation = {
    ...updatedReservation,
    reservation_id: res.locals.reservation.reservation_id,
  };
  next();
}

/**
 * Verifies that the request contains a query parameter with either the name `date` which is properly formatted as YYYY-MM-DD, or the name `mobile_number` which can be any number.
 *
 * This function will call the express error handler if neither `date` nor `mobile_number` is a query parameter in the URL.
 */
function hasValidQuery(req, res, next) {
  const { date, mobile_number } = req.query;
  if (!date && !mobile_number)
    return next({
      status: 400,
      message:
        "Missing required properties. Must include date or mobile_number.",
    });

  //Will list reservations by mobile number if included
  //This implementation will ignore date if mobile_number is included
  //Due to the wide variances in formats for mobile numbers, this is not validated.
  if (mobile_number) {
    res.locals.mobile_number = mobile_number;
    return next();
  }
  let reso_date = date ? date : getToday();
  if (!isYYYYMMDD(reso_date))
    return next({
      status: 400,
      message: `Date must be in YYYY-MM-DD format. Received ${reso_date}`,
    });
  res.locals.date = reso_date;
  next();
}

/**
 * Calls `hasValidPropertiesForReserving` validation, which ensures that all
 * required properties exist and are valid. Calls express error handler if any
 * validation errors exist.
 */
function hasRequiredProperties(req, res, next) {
  const { data } = req.body;
  if (!data)
    return next({
      status: 400,
      message: "Required reservation data is missing.",
    });

  const validatedReservation = hasValidPropertiesForReserving(req.body.data);
  if (!validatedReservation.isValid) {
    return next({ status: 400, message: validatedReservation.message });
  }
  next();
}

/**
 * Verifies that `req.body.data.status` is equal to "booked" if it exists.
 * "booked" is the only status allowed for `status`.
 */
function hasValidStatusForBooking(req, res, next) {
  const { status } = req.body.data;
  if (status && status != "booked")
    return next({
      status: 400,
      message: `Cannot create a reservation with a status other than booked. Received ${status}`,
    });
  next();
}

/**
 * Verifies that previous reservation status is not "finished" as we cannot
 * update finished reservations. Also verifies that new reservation status is a
 * valid status.
 */
function hasValidStatusForUpdating(req, res, next) {
  const prevStatus = res.locals.reservation.status;
  if (prevStatus === "finished")
    return next({
      status: 400,
      message: "Cannot update a reservation which has already finished.",
    });

  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  const { status } = req.body.data;
  if (!validStatuses.includes(status)) {
    return next({
      status: 400,
      message: `Cannot update a reservation with invalid status. Valid statuses are ${validStatuses.join(
        ", "
      )}. Received ${status}`,
    });
  }
  next();
}

async function reservationExists(req, res, next) {
  const { reservationId } = res.locals.reservationId ? res.locals : req.params;
  if (reservationId === undefined)
    next({ status: 500, message: "Internal error. Reservation id is missing" });
  if (isNaN(reservationId))
    next({ status: 400, message: "Reservation id must be a number." });
  const reservation = await service.read(reservationId);
  if (!reservation)
    return next({
      status: 404,
      message: `Reservation not found with id: ${reservationId}`,
    });
  res.locals.reservation = reservation;
  next();
}

async function create(req, res, next) {
  try {
    const reservation = await service.create(req.body.data);
    res.status(201).json({ data: reservation });
  } catch (e) {
    next({ status: 500, message: e });
  }
}
/**
 * List handler for reservation resources
 */
async function list(req, res) {
  if (res.locals.mobile_number) {
    const data = await service.search(res.locals.mobile_number);
    res.status(200).json({ data });
  } else {
    const data = await service.list(res.locals.date);
    const unfinishedReservations = data.filter(
      (reservation) =>
        reservation.status != "finished" && reservation.status != "cancelled"
    );
    res.status(200).json({ data: unfinishedReservations });
  }
}

async function read(req, res) {
  console.log(res.locals.reservation);
  res.json({ data: res.locals.reservation });
}

async function updateStatus(req, res) {
  const { status } = req.body.data;
  const updatedReservation = { ...res.locals.reservation, status };
  console.debug("update reservation status", updatedReservation);
  const data = await service.update(updatedReservation);
  res.status(200).json({ data });
}

async function update(req, res) {
  const data = await service.update({ ...res.locals.reservation });
  res.status(200).json({ data });
}

module.exports = {
  list: [hasValidQuery, asyncErrorBoundary(list)],
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    hasValidStatusForBooking,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  reservationExists,
  update: [
    asyncErrorBoundary(reservationExists),
    hasValidPropertiesForUpdating,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidProperties,
    hasValidStatusForUpdating,
    asyncErrorBoundary(updateStatus),
  ],
};
