import React from "react";

/**
 * Defines the table card component.
 * @param table
 *  the table to display.
 * @returns {JSX.Element}
 */
function TableCard({ table }) {
  const { table_name, table_id, capacity, reservation_id } = table;
  const occupiedStatus = reservation_id ? "Occupied" : "Free";

  return (
    <div className='card' style={{ width: "18rem" }}>
      <h5 className='card-title'>{`${table_name}`}</h5>
      <div className='card-body'>
        <p className='card-text'>{`Seats ${capacity} guests`}</p>
        <p
          className='card-text'
          data-table-id-status={table_id}
        >{`${occupiedStatus}`}</p>
      </div>
    </div>
  );
}

export default TableCard;
