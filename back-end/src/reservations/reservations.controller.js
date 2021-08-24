const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const {
  isYYYYMMDD,
  is24HrTime,
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

function hasValidPropertiesForUpdating(req, res, next) {
  const updatedReservation = { ...req.body.data };
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
 * Validates query parameter date matches YYYY-MM-DD format
 */
function hasValidDateQuery(req, res, next) {
  ///TODO: change this to hasValidDateOrTime - check for valid query or time
  const { date, mobile_number } = req.query;
  if (!date && !mobile_number)
    return next({
      status: 400,
      message:
        "Missing required properties. Must include date or mobile_number.",
    });

  //Will list reservations by mobile number if included
  //This implementation will ignore date if mobile_number is included
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

function isValidDate(req, res, next) {
  const validatedDate = hasValidDateForReserving(req.body.data);
  if (!validatedDate.isValid) {
    return next({ status: 400, message: validatedDate.message });
  }

  next();
}

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

function hasValidStatusForBooking(req, res, next) {
  const { status } = req.body.data;
  if (status && status != "booked")
    return next({
      status: 400,
      message: `Cannot create a reservation with a status other than booked. Received ${status}`,
    });
  next();
}

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
      (reservation) => reservation.status != "finished"
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
  list: [hasValidDateQuery, asyncErrorBoundary(list)],
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    isValidDate,
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
