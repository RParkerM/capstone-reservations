import "./ReservationForm.css";

import React, { useEffect, useState } from "react";

/**
 * Defines the component for creating/editing reservations
 *
 * @returns {JSX.Element}
 */

function ReservationForm({
  reservation = {},
  handleSubmit = () => {},
  handleCancel = () => {},
}) {
  const [reservationInfo, setReservationInfo] = useState(reservation);

  useEffect(() => {
    if (reservation?.first_name) {
      setReservationInfo(reservation);
    }
  }, [reservation]);

  const handleChange = ({ target }) => {
    let { name, value } = target;
    if (name === "people") value = parseInt(value);
    setReservationInfo({ ...reservationInfo, [name]: value });
  };

  const onClickSubmit = (event) => {
    event.preventDefault();
    handleSubmit(reservationInfo);
  };

  const onClickCancel = (event) => {
    event.preventDefault();
    handleCancel();
  };

  return (
    <form onSubmit={onClickSubmit}>
      <div className='form-group'>
        <label htmlFor='first_name'>First Name</label>
        <input
          required
          className='form-control'
          name='first_name'
          id='first_name'
          onChange={handleChange}
          value={reservationInfo?.first_name || ""}
          type='text'
        />
        <label htmlFor='last_name'>Last Name</label>
        <input
          required
          className='form-control'
          name='last_name'
          id='last_name'
          onChange={handleChange}
          value={reservationInfo?.last_name || ""}
        />
        <label htmlFor='mobile_number'>Phone Number</label>
        <input
          type='tel'
          required
          className='form-control'
          name='mobile_number'
          id='mobile_number'
          onChange={handleChange}
          value={reservationInfo?.mobile_number || ""}
        />
        <label htmlFor='reservation_date'>Date</label>
        <input
          required
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
          required
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
          type='number'
          min={1}
          required
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

      <button
        onClick={onClickCancel}
        type='button'
        className='btn btn-danger m-2'
      >
        Cancel
      </button>
    </form>
  );
}

export default ReservationForm;
