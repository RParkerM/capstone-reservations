import React from "react";
import TableCard from "./TableCard";
import "./TableList.css";

/**
 * Defines the table list component.
 * @param tables
 *  the tables to display.
 * @returns {JSX.Element}
 */
function TableList({ tables, handleErrors, refreshTables }) {
  const table_list = tables.map((table, index) => (
    <TableCard
      table={table}
      key={index}
      handleErrors={handleErrors}
      refreshTables={refreshTables}
    />
  ));

  return (
    <section className='table-list-section'>
      <h3>Tables</h3>
      <div className='table-list'>{table_list}</div>
    </section>
  );
}

export default TableList;
