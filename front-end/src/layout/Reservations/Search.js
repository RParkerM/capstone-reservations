import React, { useState } from "react";
import { listReservations } from "../../utils/api";
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
    try {
      const reservations = await listReservations({ mobile_number });
      console.debug(reservations);
      setReservations(reservations);
    } catch (err) {
      setErrors(err);
    }
  };

  const reservationList =
    reservations?.length > 0 ? (
      <ReservationList reservations={reservations} />
    ) : (
      <p>No reservations found.</p>
    );

  return (
    <>
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
