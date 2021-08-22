import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../layout/Reservations/ReservationList";
import TableList from "../layout/Tables/TableList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables({}, abortController.signal).then(setTables);
    return () => abortController.abort();
  }

  function refreshTables() {
    const abortController = new AbortController();
    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setReservationsError);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className='d-md-flex mb-3'>
        <h4 className='mb-0'>Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ReservationList reservations={reservations} />
      <TableList
        tables={tables}
        refreshTables={refreshTables}
        handleErrors={setReservationsError}
      />
    </main>
  );
}

export default Dashboard;
