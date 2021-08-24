/**
 * Check if tableInfo contains any validation errors such as missing parameters or invalid dates/times
 * @param {object} tableInfo
 * @returns array
 */
export function getValidationErrors(tableInfo) {
  // console.log("validating table", tableInfo);
  if (!tableInfo)
    throw new Error("Must pass table information to be validated.");
  const validationErrors = [];

  const { table_name, capacity } = tableInfo;
  if (!table_name) validationErrors.push("Please include the table name.");
  if (capacity === undefined || capacity === null)
    validationErrors.push("Please include the table's capacity.");
  if (isNaN(capacity) || capacity < 1)
    validationErrors.push("Table capacity must be a number greater than 0.");
  // console.log(validationErrors);
  return validationErrors;
}
