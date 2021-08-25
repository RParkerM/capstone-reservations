import React, { useEffect, useState } from "react";
import { cancelReservation, listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../layout/Reservations/ReservationList";
import TableList from "../layout/Tables/TableList";
import { formateDateAsMDY, next, today } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  // const [date, setDate] = useState(dateString || today());

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function handleCancelReservation(reservation_id) {
    const abortController = new AbortController();
    setReservationsError(null);

    cancelReservation(reservation_id, abortController.signal)
      .then(loadDashboard)
      .catch(setReservationsError);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className='d-md-flex mb-3'>
        <h4 className='mb-0'>Reservations for {formateDateAsMDY(date)}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ReservationList
        reservations={reservations}
        handleCancelReservation={handleCancelReservation}
      />
      <TableList refresh={loadDashboard} handleErrors={setReservationsError} />
    </main>
  );
}

export default Dashboard;
