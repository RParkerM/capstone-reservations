import { getDateFromReso } from "../utils/date-time";

/**
 *
 * @param {object} reservationInfo
 * @returns {String[]}
 * An array of strings, representing validation errors specific to date and time
 */
function getDateAndTimeValidationErrors(reservationInfo) {
  //Return early if we are missing our date and time values
  if (!reservationInfo.reservation_date || !reservationInfo.reservation_time)
    return [];
  const errors = [];
  const reso_date = getDateFromReso(reservationInfo);

  const now = new Date();
  if (reso_date < now) {
    errors.push("Cannot make reservations in the past.");
  }
  if (reso_date.getDay() === 2) {
    errors.push("Cannot make reservations on Tuesday. Restaurant is closed.");
  }

  //Time the restaurant opens on reservation date
  const openTime = new Date(
    reso_date.getFullYear(),
    reso_date.getMonth(),
    reso_date.getDate(),
    10,
    30
  );
  if (reso_date < openTime) {
    errors.push(
      "Cannot make reservation before 10:30 AM when restaurant opens."
    );
  }

  //30 minutes before time the restaurant closes on reservation date
  const closeTime = new Date(
    reso_date.getFullYear(),
    reso_date.getMonth(),
    reso_date.getDate(),
    21,
    30
  );
  if (reso_date > closeTime) {
    errors.push(
      "Cannot make reservation after 9:30PM as restaurant closes at 10."
    );
  }

  return errors;
}

/**
 * Gets all missing properties that are required for a reservation. This is not exported as it is not used outside of this file.
 * @param {object} reservationInfo
 * @returns {array}
 * Array of strings, representing errors for missing properties
 */
function getMissingProperties(reservationInfo) {
  const missingProperties = [];
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = reservationInfo;
  if (!first_name) missingProperties.push("Please include the first name.");
  if (!last_name) missingProperties.push("Please include the last name.");
  if (!mobile_number)
    missingProperties.push("Please include the mobile number.");
  if (!mobile_number)
    missingProperties.push("Please include the mobile number.");
  if (!reservation_date)
    missingProperties.push("Please include the reservation date.");
  if (!reservation_time)
    missingProperties.push("Please include the reservation time.");
  if (people === undefined || people === null)
    missingProperties.push("Please include the party size.");
  return missingProperties;
}

/**
 * Check if reservationInfo contains any validation errors such as missing parameters or invalid dates/times
 * @param {object} reservationInfo
 * @returns {array}
 * Array of strings, representing all validation errors for the reservation
 */
export function getValidationErrors(reservationInfo) {
  if (!reservationInfo)
    throw new Error("Must pass reservation information to be validated.");
  let validationErrors = [];
  validationErrors = validationErrors.concat(
    getMissingProperties(reservationInfo)
  );
  validationErrors = validationErrors.concat(
    getDateAndTimeValidationErrors(reservationInfo)
  );
  if (validationErrors.length > 0) console.error(validationErrors);
  return validationErrors;
}
