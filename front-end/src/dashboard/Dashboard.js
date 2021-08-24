import React, { useEffect, useState } from "react";
import { cancelReservation, listReservations, listTables } from "../utils/api";
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

    Promise.all([
      listTables({}, abortController.signal),
      listReservations({ date }, abortController.signal),
    ])
      .then((results) => {
        setTables(results[0]);
        setReservations(results[1]);
      })
      .catch((errors) => setReservationsError);
    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setReservationsError);
    return () => abortController.abort();
    // const abortController = new AbortController();
    // setReservationsError(null);
    // listReservations({ date }, abortController.signal)
    //   .then(setReservations)
    //   .catch(setReservationsError);
    // listTables({}, abortController.signal).then(setTables);
    // return () => abortController.abort();
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
        <h4 className='mb-0'>Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ReservationList
        reservations={reservations}
        handleCancelReservation={handleCancelReservation}
      />
      <TableList
        tables={tables}
        refreshTables={loadDashboard}
        handleErrors={setReservationsError}
      />
    </main>
  );
}

export default Dashboard;
