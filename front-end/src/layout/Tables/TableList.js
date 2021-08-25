import React, { useEffect, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import TableCard from "./TableCard";
import { listTables } from "../../utils/api";
import "./TableList.css";

/**
 * Defines the table list component.
 * @param tables
 *  the tables to display.
 * @returns {JSX.Element}
 */
function TableList({ handleErrors, refresh }) {
  const [tables, setTables] = useState([]);
  const [errors, setErrors] = useState(null);

  useEffect(loadTables, []);

  function loadTables() {
    const abortController = new AbortController();
    listTables({}, abortController.signal).then(setTables).catch(setErrors);

    return () => abortController.abort();
  }

  const table_list = tables.map((table, index) => (
    <TableCard
      table={table}
      key={index}
      handleErrors={handleErrors}
      refreshTables={refreshTables}
    />
  ));

  function refreshTables() {
    loadTables();
    refresh();
  }

  return (
    <section className='table-list-section'>
      <ErrorAlert error={errors} />
      <h3>Tables</h3>
      <div className='table-list'>{table_list}</div>
    </section>
  );
}

export default TableList;
