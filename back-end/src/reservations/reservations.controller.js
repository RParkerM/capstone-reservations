const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const { isYYYYMMDD, is24HrTime } = require("../utils/validation");
const getToday = require("../utils/time").getTodayYYYYMMdd;
const { getLocalTime, isTuesday } = require("../utils/time");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
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

/**
 * Validates query parameter date matches YYYY-MM-DD format
 */
function hasValidDateQuery(req, res, next) {
  let reso_date = req.query.date ? req.query.date : getToday();
  if (!isYYYYMMDD(reso_date))
    return next({
      status: 400,
      message: `Date must be in YYYY-MM-DD format. Received ${reso_date}`,
    });
  res.locals.date = reso_date;
  next();
}

function isValidDate(req, res, next) {
  console.log("is it previous? IDK");
  const { reservation_date, reservation_time } = req.body.data;
  const year = reservation_date.substring(0, 4);
  const month = reservation_date.substring(5, 7);
  const day = reservation_date.substring(8, 10);
  const hour = reservation_time.substring(0, 2);
  const minutes = reservation_time.substring(3, 5);

  console.info(`${year}-${month}-${day}`);

  const reso_date = new Date(year, month - 1, day, hour, minutes);
  reso_date.setMinutes(reso_date.getMinutes() - reso_date.getTimezoneOffset());

  console.info("local time", getLocalTime());
  console.info("now", reso_date);

  const openTime = new Date(year, month - 1, day, 10, 30);
  const closeTime = new Date(year, month - 1, day, 21, 30);

  openTime.setMinutes(openTime.getMinutes() - openTime.getTimezoneOffset());
  closeTime.setMinutes(closeTime.getMinutes() - closeTime.getTimezoneOffset());

  if (reso_date < getLocalTime()) {
    return next({
      status: 400,
      message: `Reservation date must be in the future. Received ${year}-${month}-${day} ${hour}:${minutes}`,
    });
  }

  if (isTuesday(reso_date)) {
    return next({
      status: 400,
      message: `Reservation cannot fall on a Tuesday, when restaurant is closed. Received date ${year}-${month}.`,
    });
  }

  if (reso_date < openTime) {
    return next({
      status: 400,
      message: `Cannot make reservation before 10:30 AM when restaurant opens. Received ${hour}:${minutes}.`,
    });
  }
  if (reso_date > closeTime) {
    return next({
      status: 400,
      message: `Cannot make reservation after 9:30PM as restaurant closes at 10. Received ${hour}:${minutes}.`,
    });
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
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = data;
  if (!first_name)
    return next({
      status: 400,
      message: "Required property first_name is missing",
    });
  if (!last_name)
    return next({
      status: 400,
      message: "Required property last_name is missing",
    });
  if (!mobile_number)
    return next({
      status: 400,
      message: "Required property mobile_number is missing",
    });
  if (!reservation_date || !isYYYYMMDD(reservation_date))
    return next({
      status: 400,
      message:
        "Required property reservation_date is missing or invalid. Required format: YYYY-MM-DD.",
    });
  if (!reservation_time || !is24HrTime(reservation_time))
    return next({
      status: 400,
      message: `Required property reservation_time is missing or invalid. Required 24 hour format: HH:SS. Received ${reservation_time}`,
    });
  if (typeof people !== "number" || isNaN(people) || !people) {
    return next({
      status: 400,
      message:
        "Required property people is missing or zero. Must be a number greater than zero.",
    });
  }
  next();
}

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  if (reservationId === undefined)
    next({ status: 500, message: "Internal error. Reservation id is missing" });
  const reservation = await service.read(reservationId);
  if (!reservation)
    return next({
      status: 404,
      message: `Reservation not found with id: ${reservationId}`,
    });
  res.locals.reservation = reservation;
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
  const data = await service.list(res.locals.date);
  res.status(200).json({ data });
}

async function read(req, res) {
  res.json({ data: res.locals.reservation });
}

module.exports = {
  list: [hasValidDateQuery, asyncErrorBoundary(list)],
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    isValidDate,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
};
