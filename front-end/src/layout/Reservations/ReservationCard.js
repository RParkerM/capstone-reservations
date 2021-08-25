import React from "react";
import { Link } from "react-router-dom";
import { formatTimeAs12HR } from "../../utils/date-time";

/**
 * Defines the reservation card component.
 * @param reservation
 *  the reservation to display.
 * @returns {JSX.Element}
 */
function ReservationCard({ reservation, handleCancelReservation }) {
  const {
    first_name,
    last_name,
    // mobile_number,
    reservation_date,
    reservation_time,
    reservation_id,
    status,
  } = reservation;

  const SeatButton =
    status === "booked" ? (
      <Link
        to={`/reservations/${reservation_id}/seat`}
        className='btn btn-primary'
      >
        Seat
      </Link>
    ) : null;
  const CancelButton =
    status === "booked" ? (
      <button
        type='button'
        className={"btn btn-danger"}
        onClick={onClickCancelReservation}
        data-reservation-id-cancel={reservation_id}
      >
        Cancel
      </button>
    ) : null;

  function onClickCancelReservation(event) {
    event.preventDefault();
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      handleCancelReservation(reservation.reservation_id);
    }
  }

  //TODO: display date in a better way, 12hr

  return (
    <div className='card' style={{ width: "18rem" }}>
      <div className='card-body'>
        <h5 className='card-title'>{`${first_name} ${last_name}`}</h5>
        <p className='card-text'>{reservation_date}</p>
        <p className='card-text'>{`${formatTimeAs12HR(reservation_time)}`}</p>
        <p data-reservation-id-status={reservation_id}>{status}</p>
        <Link
          className={"btn btn-secondary"}
          to={`/reservations/${reservation_id}/edit`}
        >
          Edit
          <i className='bi bi-pencil-square'></i>
        </Link>
        {CancelButton}
        {SeatButton}
      </div>
    </div>
  );
}

export default ReservationCard;
