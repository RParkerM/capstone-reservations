import React from "react";
import { Link } from "react-router-dom";

/**
 * Defines the reservation card component.
 * @param reservation
 *  the reservation to display.
 * @returns {JSX.Element}
 */
function ReservationCard({ reservation }) {
  const {
    first_name,
    last_name,
    // mobile_number,
    // reservation_date,
    reservation_time,
    reservation_id,
  } = reservation;

  return (
    <div className='card' style={{ width: "18rem" }}>
      <div className='card-body'>
        <h5 className='card-title'>{`${first_name} ${last_name}`}</h5>
        <p className='card-text'>{`${reservation_time}`}</p>
        <Link
          to={`/reservations/${reservation_id}/seat`}
          className='btn btn-primary'
        >
          Seat
        </Link>
      </div>
    </div>
  );
}

export default ReservationCard;
