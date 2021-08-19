import "./NewReservation.css";

import React, { useState } from "react";
import { useHistory } from "react-router";
import { createReservation } from "../../utils/api";
import { getDateFromReso } from "../../utils/date-time";
import ErrorAlert from "../ErrorAlert";

/**
 * Defines the component for creating a new reservation
 *
 * @returns {JSX.Element}
 */

function NewReservation({ reservation = {}, handleSubmit = () => {} }) {
  const [reservationInfo, setReservationInfo] = useState(reservation);
  const [errors, setErrors] = useState(undefined);
  const history = useHistory();

  const handleChange = ({ target }) => {
    let { name, value } = target;
    if (name === "people") value = parseInt(value);
    setReservationInfo({ ...reservationInfo, [name]: value });
  };

  const isValidReservation = (reservationInfo) => {
    if (!reservationInfo.reservation_date || !reservationInfo.reservation_time)
      return false;
    const now = new Date();
    const reso_date = getDateFromReso(reservationInfo);
    let errorMessages = [];
    if (reso_date < now) {
      errorMessages.push("Cannot make reservations in the past.");
    }
    if (reso_date.getDay() == 2) {
      errorMessages.push(
        "Cannot make reservations on Tuesday. Restaurant is closed."
      );
    }
    if (errorMessages.length > 0) {
      setErrors({ message: errorMessages.join("\n") });
      return false;
    } else {
      setErrors(undefined);
    }
    return true;
  };

  ///TODO REFACTOR ALL VALIDATION FROM THIS WIDGET
  const submit = async (event) => {
    const abortController = new AbortController();

    event.preventDefault();
    console.log(reservationInfo);
    if (isValidReservation(reservationInfo)) {
      try {
        const reservation = await createReservation(
          reservationInfo,
          abortController.signal
        );
        console.debug(reservation);
        history.push(`/dashboard?date=${reservationInfo.reservation_date}`);
      } catch (err) {
        if (err.name === "AbortError") {
          console.info("Aborted");
        } else {
          throw err;
        }
      }
    }

    handleSubmit(reservationInfo);
  };

  const handleCancel = (event) => {
    history.goBack();
  };

  return (
    <>
      <ErrorAlert error={errors} />
      <form onSubmit={submit}>
        <div className='form-group'>
          <label htmlFor='first_name'>First Name</label>
          <input
            className='form-control'
            name='first_name'
            id='first_name'
            onChange={handleChange}
            value={reservationInfo?.first_name || ""}
            type='text'
          />
          <label htmlFor='last_name'>Last Name</label>
          <input
            className='form-control'
            name='last_name'
            id='last_name'
            onChange={handleChange}
            value={reservationInfo?.last_name || ""}
          />
          <label htmlFor='mobile_number'>Phone Number</label>
          <input
            className='form-control'
            name='mobile_number'
            id='mobile_number'
            onChange={handleChange}
            value={reservationInfo?.mobile_number || ""}
          />
          <label htmlFor='reservation_date'>Date</label>
          <input
            className='form-control'
            name='reservation_date'
            id='reservation_date'
            onChange={handleChange}
            type='date'
            placeholder='YYYY-MM-DD'
            pattern='\d{4}-\d{2}-\d{2}'
            value={reservationInfo?.reservation_date || ""}
          />
          <label htmlFor='reservation_time'>Time</label>
          <input
            className='form-control'
            name='reservation_time'
            id='reservation_time'
            onChange={handleChange}
            type='time'
            placeholder='HH:MM'
            pattern='[0-9]{2}:[0-9]{2}'
            value={reservationInfo?.reservation_time || ""}
          />
          {
            //input for party size
          }
          <label htmlFor='people'>Party Size</label>
          <input
            className='form-control'
            name='people'
            id='people'
            onChange={handleChange}
            value={reservationInfo?.people || ""}
          />
        </div>
        <button type='submit' className='btn btn-primary m-2'>
          Submit
        </button>
        <button onClick={handleCancel} className='btn btn-danger m-2'>
          Cancel
        </button>
      </form>
    </>
  );
}

// display a Submit button that, when clicked, saves the new reservation, then displays the /dashboard page for the date of the new reservation
// display a Cancel button that, when clicked, returns the user to the previous page
// display any error messages returned from the API

export default NewReservation;
