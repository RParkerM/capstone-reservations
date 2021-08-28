import React, { useState } from "react";
import { listReservations, cancelReservation } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";
import ReservationList from "./ReservationList";

/**
 * Defines the component for searching reservations
 *
 * @returns {JSX.Element}
 */

function SearchReservations() {
  const [mobile_number, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [errors, setErrors] = useState(undefined);

  const handleChange = ({ target }) => {
    let { value } = target;
    setMobileNumber(value);
  };

  const submit = async (event) => {
    event.preventDefault();
    beginSearch();
  };

  const beginSearch = async () => {
    try {
      const reservations = await listReservations({ mobile_number });
      //Only show reservations with the status of booked or seated
      let filteredReservations = reservations.filter((reservation) =>
        ["booked", "seated"].includes(reservation.status)
      );
      setReservations(filteredReservations);
    } catch (err) {
      setErrors(err);
    }
  };

  function handleCancelReservation(reservation_id) {
    const abortController = new AbortController();
    setErrors(null);

    cancelReservation(reservation_id, abortController.signal)
      .then(beginSearch)
      .catch(setErrors);
  }

  const reservationList =
    reservations?.length > 0 ? (
      <ReservationList
        handleCancelReservation={handleCancelReservation}
        reservations={reservations}
      />
    ) : (
      <p>No reservations found.</p>
    );

  return (
    <>
      <h1 className='mb-3'>Search Reservations</h1>

      <ErrorAlert error={errors} />
      <form onSubmit={submit}>
        <div className='form-group'>
          <label htmlFor='mobile_number'>Mobile Number</label>
          <input
            className='form-control'
            name='mobile_number'
            id='mobile_number'
            onChange={handleChange}
            value={mobile_number}
            type='text'
          />
        </div>
        <button type='submit' className='btn btn-primary m-2'>
          Find
        </button>
      </form>
      {reservationList}
    </>
  );
}

export default SearchReservations;
