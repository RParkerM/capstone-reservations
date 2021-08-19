import { getDateFromReso } from "../../utils/date-time";


function getDateAndTimeValidationErrors(reservationInfo){
    const errors = [];
    const now = new Date();
    const reso_date = getDateFromReso(reservationInfo);
    const openTime = new Date(reso_date.getYear(),reso_date.getMonth(),reso_date.getDate(),"10",
    "30");
    if (reso_date < now) {
        errorMessages.push("Cannot make reservations in the past.");
      }
    if (reso_date.getDay() == 2) {
        errorMessages.push(
         "Cannot make reservations on Tuesday. Restaurant is losed."
     );
    }
      return errors;
}

/**
 * Gets all missing properties that are required for a reservation. This is not exported as it is not used outside of this file.
 * @param {object} reservationInfo 
 * @returns array
 */
function getMissingProperties(reservationInfo){
    const missingProperties = [];
    const {
        first_name,
        last_name,
        mobile_number,
        reservation_date,
        reservation_time,
        people,
      } = reservationInfo;
      if(!first_name) missingProperties.push("Please include the first name.")
      if(!last_name) missingProperties.push("Please include the last name.")
      if(!mobile_number) missingProperties.push("Please include the mobile number.")
      if(!mobile_number) missingProperties.push("Please include the mobile number.")
      if(!reservation_date) missingProperties.push("Please include the reservation date.")
      if(!reservation_time) missingProperties.push("Please include the reservation time.")
      if(people === undefined || people === null) missingProperties.push("Please include the party size.")
      return missingProperties;
}


/**
 * Check if reservationInfo contains any validation errors such as missing parameters or invalid dates/times
 * @param {object} reservationInfo 
 * @returns array
 */
export function getValidationErrors(reservationInfo){
    if(!reservationInfo) throw new Error('Must pass reservation information to be validated.');
    const validationErrors = [];
    validationErrors.concat(getMissingProperties(reservationInfo));
    const {reservation_date, reservation_time, }
    return [];
}