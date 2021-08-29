import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import { listTables, getReservation, seatTable } from "../../utils/api";
import { formatTimeAs12HR } from "../../utils/date-time";
import ErrorAlert from "../ErrorAlert";

/**
 * Defines the component for seating a reservation.
 * @returns {JSX.Element}
 */
function SeatReservation() {
  const history = useHistory();

  const [tables, setTables] = useState([]);
  const [reservation, setReservation] = useState({ reservation_time: "00:00" });
  const [errors, setErrors] = useState(null);
  const { reservationId } = useParams();
  const [tableId, setTableId] = useState("");

  useEffect(loadInformation, [reservationId]);

  function loadInformation() {
    const abortController = new AbortController();
    setErrors(null);
    Promise.all([
      listTables({}, abortController.signal),
      getReservation(reservationId, abortController.signal),
    ])
      .then((responses) => {
        setTables(responses[0]);
        setReservation(responses[1]);
      })
      .catch((errors) => {
        setErrors(errors);
      });
  }

  function handleChange(event) {
    setTableId(event.target.value);
  }

  function submit(event) {
    event.preventDefault();
    setErrors(null);
    if (tableId === "") {
      setErrors("Please select a table.");
    } else if (isNaN(tableId)) {
      setErrors("Please choose a valid table from the dropdown.");
    } else {
      SeatReservationAtTable();
    }
  }

  const SeatReservationAtTable = async () => {
    const abortController = new AbortController();
    setErrors(null);
    try {
      const table = await seatTable(
        tableId,
        reservationId,
        abortController.signal
      );
      console.debug(table);
      history.push(`/dashboard`);
    } catch (err) {
      if (err.name === "AbortError") {
        console.info("Aborted");
      } else {
        setErrors(err);
      }
    }
  };

  const handleCancel = (event) => {
    history.goBack();
  };

  const tableOptions = tables.map((table, index) => (
    <option key={index} value={table.table_id}>
      {table.table_name} - {table.capacity}
    </option>
  ));

  const { first_name, last_name, people, reservation_time } = reservation;

  return (
    <>
      <ErrorAlert error={errors} />
      <form onSubmit={submit}>
        <h3 className='my-2'>
          {`Now seating ${first_name} ${last_name}, party of ${people}`}
        </h3>
        <p>{`Reservation time: ${formatTimeAs12HR(reservation_time)}`}</p>
        <label htmlFor='table_id'>Seat at table:</label>
        <select
          className='form-control my-2'
          name='table_id'
          id='table_id'
          value={tableId}
          onChange={handleChange}
        >
          <option value='' selected disabled hidden>
            --Please choose a table--
          </option>
          {tableOptions}
        </select>
        <button type='submit' className='btn btn-primary m-2'>
          Submit
        </button>
        <button
          type='button'
          onClick={handleCancel}
          className='btn btn-danger m-2'
        >
          Cancel
        </button>
      </form>
    </>
  );
}

export default SeatReservation;
