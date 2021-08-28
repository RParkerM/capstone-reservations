import "./NewTable.css";

import React, { useState } from "react";
import { useHistory } from "react-router";
import { createTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";
import { getValidationErrors } from "../../validation/tables";

/**
 * Defines the component for creating a new table
 *
 * @returns {JSX.Element}
 */

function NewTable({ table = {}, handleSubmit = () => {} }) {
  const [tableInfo, setTableInfo] = useState(table);
  const [errors, setErrors] = useState(undefined);
  const history = useHistory();

  const handleChange = ({ target }) => {
    let { name, value } = target;
    if (name === "capacity") value = parseInt(value);
    setTableInfo({ ...tableInfo, [name]: value });
  };

  const isValidTable = (tableInfo) => {
    // console.log("validating ntable");
    const errorMessages = getValidationErrors(tableInfo);
    if (errorMessages.length > 0) {
      setErrors({ message: errorMessages.join("\n") });
      return false;
    } else {
      setErrors(undefined);
    }
    return true;
  };

  const submit = async (event) => {
    const abortController = new AbortController();

    event.preventDefault();
    // console.log(tableInfo);
    if (isValidTable(tableInfo)) {
      try {
        const table = await createTable(tableInfo, abortController.signal);
        console.debug(table);
        history.push("/dashboard");
      } catch (err) {
        if (err.name === "AbortError") {
          console.info("Aborted");
        } else {
          throw err;
        }
      }
    }

    handleSubmit(tableInfo);
  };

  const handleCancel = (event) => {
    history.goBack();
  };

  return (
    <>
      <h1 className='mb-3'>Create Table</h1>

      <ErrorAlert error={errors} />
      <form onSubmit={submit}>
        <div className='form-group'>
          {
            //TODO Table name must be 2 characters long
          }
          <label htmlFor='table_name'>First Name</label>
          <input
            className='form-control'
            name='table_name'
            id='table_name'
            onChange={handleChange}
            value={tableInfo?.table_name || ""}
            type='text'
          />
          {
            //TODO input for table capacity, must be 1 person
          }
          <label htmlFor='capacity'>Seats</label>
          <input
            className='form-control'
            name='capacity'
            id='capacity'
            onChange={handleChange}
            value={tableInfo?.capacity || ""}
          />
        </div>
        <button type='submit' className='btn btn-primary m-2'>
          Submit
        </button>
        <button onClick={handleCancel} className='btn btn-danger m-2'>
          Cancel
        </button>
      </form>
    </>
  );
}

///TODO display any error messages returned from the API

export default NewTable;
