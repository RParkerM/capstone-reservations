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
    status,
  } = reservation;

  const SeatButton =
    status == "booked" ? (
      <Link
        to={`/reservations/${reservation_id}/seat`}
        className='btn btn-primary'
      >
        Seat
      </Link>
    ) : null;

  console.log(reservation);
  function onClickCancelReservation(event) {
    //TODO: implement cancel reso
  }

  //TODO: display date in a better way, 12hr

  return (
    <div className='card' style={{ width: "18rem" }}>
      <div className='card-body'>
        <h5 className='card-title'>{`${first_name} ${last_name}`}</h5>
        <p className='card-text'>{`${reservation_time}`}</p>
        <p data-reservation-id-status={reservation_id}>{status}</p>
        <Link
          className={"btn btn-secondary"}
          to={`/reservations/${reservation_id}/edit`}
        >
          Edit
          <i className='bi bi-pencil-square'></i>
        </Link>
        <button
          type='button'
          className={"btn btn-danger"}
          onClick={onClickCancelReservation}
          data-reservation-id-cancel={reservation_id}
        >
          Cancel
        </button>
        {SeatButton}
      </div>
    </div>
  );
}

export default ReservationCard;
