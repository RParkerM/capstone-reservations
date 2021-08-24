/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

//TODO: remove these fake data
const fakeReservationData = require("./fakeresodata.json");
const fakeTableData = require("./faketabledata.json");

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservations.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  //TODO: Remove this
  return returnFakeResoData(params);

  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  console.log(url);

  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Retrieves an existing reservation.
 * @returns {Promise<reservation>}
 *  a promise that resolves to a reservation object
 */

export async function getReservation(reservationId, signal) {
  console.log("getting reso", reservationId);
  const url = new URL(`${API_BASE_URL}/reservations/${reservationId}`);
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function listTables(params, signal) {
  return returnFakeTableData(params);

  const url = new URL(`${API_BASE_URL}/tables`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, []);
}

function returnFakeResoData(params = {}) {
  const { mobile_number, date } = params;
  console.log(fakeReservationData);
  console.log(JSON.stringify(params));
  return fakeReservationData.map((reservation, index) => {
    return {
      ...reservation,
      status: "booked",
      reservation_id: index + 1,
    };
  });
}
function returnFakeTableData(params = {}) {
  return fakeTableData;
}

export async function createReservation(reservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options, []);
}

export async function createTable(table, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  const table_returned = await fetchJson(url, options, []);
  return table_returned;
}

export async function seatTable(tableId, reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id } }),
    signal,
  };
  console.log(options);
  const table_returned = await fetchJson(url, options, []);
  return table_returned;
}

export async function finishTable(tableId, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
  const options = {
    method: "DELETE",
    headers,
    body: JSON.stringify({}),
    signal,
  };
  const table_returned = await fetchJson(url, options, []);
  return table_returned;
}
