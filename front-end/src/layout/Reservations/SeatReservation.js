import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import { listTables, getReservation, seatTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

/**
 * Defines the component for seating a reservation.
 * @returns {JSX.Element}
 */
function SeatReservation() {
  const history = useHistory();

  const [tables, setTables] = useState([]);
  const [reservation, setReservation] = useState([]);
  const [errors, setErrors] = useState(null);
  const { reservationId } = useParams();
  const [tableId, setTableId] = useState([""]);

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
    console.log(event.target.value);
  }

  const submit = (event) => {
    event.preventDefault();
    setErrors(null);
    if (tableId === "") {
      setErrors("Please select a table.");
    } else if (isNaN(tableId)) {
      setErrors("Please choose a valid table from the dropdown.");
    } else {
      SeatReservationAtTable();
    }
  };

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

  return (
    <>
      <ErrorAlert error={errors} />
      <form onSubmit={submit}>
        <label htmlFor='table_id'>Seat at table:</label>
        <select
          className='form-control'
          name='table_id'
          id='table_id'
          value={tableId}
          onChange={handleChange}
        >
          <option value=''>--Please choose a table--</option>
          {tableOptions}
        </select>
        <button type='submit' className='btn btn-primary m-2'>
          Submit
        </button>
        <button onClick={handleCancel} className='btn btn-danger m-2'>
          Cancel
        </button>
        {JSON.stringify(tables)}
        <p>Reservation follows:</p>
        {JSON.stringify(reservation)}
      </form>
    </>
  );
}

export default SeatReservation;