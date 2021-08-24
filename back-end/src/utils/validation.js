const { getLocalTime, isTuesday } = require("./time");

function isYYYYMMDD(string) {
  return /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(string);
}
function is24HrTime(string) {
  return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(string);
}

/**
 * Validates that dates for reservation are not in the past, on closed
 * days, before opening or after closing.
 * @param {object} reservation
 * @returns {object} Object with structure {isValid:bool, message:string}
 */
function hasValidDateForReserving(reservation) {
  const { reservation_date, reservation_time } = reservation;
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
    return {
      isValid: false,
      message: `Reservation date must be in the future. Received ${year}-${month}-${day} ${hour}:${minutes}`,
    };
  }

  if (isTuesday(reso_date)) {
    return {
      isValid: false,
      message: `Reservation cannot fall on a Tuesday, when restaurant is closed. Received date ${year}-${month}.`,
    };
  }

  if (reso_date < openTime) {
    return {
      isValid: false,
      message: `Cannot make reservation before 10:30 AM when restaurant opens. Received ${hour}:${minutes}.`,
    };
  }
  if (reso_date > closeTime) {
    return {
      isValid: false,
      message: `Cannot make reservation after 9:30PM as restaurant closes at 10. Received ${hour}:${minutes}.`,
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validates that dates for reservation are not in the past, on closed
 * days, before opening or after closing.
 * @param {object} reservation
 * @returns {object} Object with structure {isValid:bool, message:string}
 */
function hasValidPropertiesForReserving(reservation) {
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = reservation;
  console.log(reservation);
  if (!first_name)
    return {
      isValid: false,
      message: "Required property first_name is missing",
    };
  if (!last_name)
    return {
      isValid: false,
      message: "Required property last_name is missing",
    };
  if (!mobile_number)
    return {
      isValid: false,
      message: "Required property mobile_number is missing",
    };
  if (!reservation_date || !isYYYYMMDD(reservation_date))
    return {
      isValid: false,
      message:
        "Required property reservation_date is missing or invalid. Required format: YYYY-MM-DD.",
    };
  if (!reservation_time || !is24HrTime(reservation_time))
    return {
      isValid: false,
      message: `Required property reservation_time is missing or invalid. Required 24 hour format: HH:SS. Received ${reservation_time}`,
    };
  if (typeof people !== "number" || isNaN(people) || !people) {
    return {
      isValid: false,
      message:
        "Required property people is missing or zero. Must be a number greater than zero.",
    };
  }
  return hasValidDateForReserving(reservation);
}

module.exports = {
  isYYYYMMDD,
  is24HrTime,
  hasValidDateForReserving,
  hasValidPropertiesForReserving,
};
