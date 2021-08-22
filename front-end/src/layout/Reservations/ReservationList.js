import React from "react";
import ReservationCard from "./ReservationCard";
import "./ReservationList.css";

/**
 * Defines the reservation list component.
 * @param reservations
 *  the reservations to display.
 * @returns {JSX.Element}
 */
function ReservationList({ reservations }) {
  const reservation_list = reservations.map((reservation, index) => (
    <ReservationCard reservation={reservation} key={index} />
  ));

  return <div className='reservation-list'>{reservation_list}</div>;
}

export default ReservationList;
