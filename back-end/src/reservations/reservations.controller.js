const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const { isYYYYMMDD, is24HrTime } = require("../utils/validation");

const getToday = require("../utils/time").getTodayYYYYMMdd;

/**
 * Validates query parameter date matches YYYY-MM-DD format
 */
function hasValidDate(req, res, next) {
  let reso_date = req.query.date ? req.query.date : getToday();
  if (!isYYYYMMDD(reso_date))
    return next({
      status: 400,
      message: `Date must be in YYYY-MM-DD format. Received ${reso_date}`,
    });
  res.locals.date = reso_date;
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
      message:
        "Required property reservation_time is missing or invalid. Required 24 hour format: HH:SS",
    });
  if (!people || isNaN(people))
    return next({
      status: 400,
      message:
        "Required property people is missing or zero. Must be a number greater than zero.",
    });
  next();
}

async function create(req, res) {}
/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const data = await service.list(res.locals.date);
  res.status(200).json({ data });
}

module.exports = {
  list: [hasValidDate, asyncErrorBoundary(list)],
};
