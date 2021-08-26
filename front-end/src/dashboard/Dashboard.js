import React, { useEffect, useState } from "react";
import { cancelReservation, listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../layout/Reservations/ReservationList";
import TableList from "../layout/Tables/TableList";
import { formateDateAsMDY, previous, next, today } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ dateString }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [date, setDate] = useState(dateString);

  useEffect(loadDashboard, [date]);
  console.log(dateString, date);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);

    listReservations({ date }, abortController.signal)
      .then((data) => {
        setReservations(
          data.filter((reservation) =>
            ["booked", "seated"].includes(reservation.status)
          )
        );
      })
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

  function goToNextDay() {
    setDate(next(date));
  }
  function goToPrevDay() {
    setDate(previous(date));
  }
  function goToToday() {
    setDate(today());
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className='d-md-flex mb-3'>
        <h4 className='mb-0'>Reservations for {formateDateAsMDY(date)}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <button
        type='button'
        className='btn btn-primary'
        name='nextDayBtn'
        onClick={goToNextDay}
      >
        Next Day
      </button>
      <button
        type='button'
        className='btn btn-primary'
        name='todayBtn'
        onClick={goToToday}
      >
        Go to Today
      </button>
      <button
        type='button'
        className='btn btn-primary'
        name='prevDayBtn'
        onClick={goToPrevDay}
      >
        Previous Day
      </button>
      <ReservationList
        reservations={reservations}
        handleCancelReservation={handleCancelReservation}
      />
      <TableList refresh={loadDashboard} handleErrors={setReservationsError} />
    </main>
  );
}

export default Dashboard;
