import React from "react";
import TableCard from "./TableCard";
import "./TableList.css";

/**
 * Defines the table list component.
 * @param tables
 *  the tables to display.
 * @returns {JSX.Element}
 */
function TableList({ tables }) {
  const table_list = tables.map((table, index) => (
    <TableCard table={table} key={index} />
  ));

  return <div className='table-list'>{table_list}</div>;
}

export default TableList;