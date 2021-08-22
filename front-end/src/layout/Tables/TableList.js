import React from "react";
import TableCard from "./TableCard";

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

  return table_list;
}

export default TableList;
