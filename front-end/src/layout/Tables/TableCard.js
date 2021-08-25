import React from "react";
import { finishTable } from "../../utils/api";

/**
 * Defines the table card component.
 * @param table
 *  the table to display.
 * @returns {JSX.Element}
 */
function TableCard({ table, handleErrors, refreshTables }) {
  const { table_name, table_id, capacity, reservation_id } = table;

  const finish = async () => {
    const abortController = new AbortController();
    if (
      !window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    )
      return;
    try {
      await finishTable(table_id, abortController.signal);
      refreshTables();
    } catch (err) {
      handleErrors(err);
    }
  };

  const occupiedStatus = reservation_id ? "Occupied" : "Free";
  const finishButton = reservation_id ? (
    <button
      data-table-id-finish={table_id}
      className='btn btn-primary'
      onClick={finish}
    >
      Finish Table
    </button>
  ) : null;

  return (
    <div className='card' style={{ width: "18rem" }}>
      <h5 className='card-title'>{`${table_name}`}</h5>
      <div className='card-body'>
        <p className='card-text'>{`Seats ${capacity} guests`}</p>
        <p
          className='card-text'
          data-table-id-status={table_id}
        >{`${occupiedStatus}`}</p>
        {finishButton}
      </div>
    </div>
  );
}

export default TableCard;
