import React from "react";
import ReservationCard from "./ReservationCard";

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

  return reservation_list;
}

export default ReservationList;
