const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const VALID_PROPERTIES = ["capacity", "table_name"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function hasRequiredProperties(req, res, next) {
  const { data } = req.body;
  if (!data)
    return next({
      status: 400,
      message: "Required table data is missing.",
    });
  const { table_name, capacity } = data;
  if (!table_name)
    return next({
      status: 400,
      message: "Required property table_name is missing",
    });
  if (typeof table_name != "string" || table_name.length < 2)
    return next({
      status: 400,
      message:
        "Property table_name must be a string which is at least 2 characters long.",
    });

  if (typeof capacity !== "number" || isNaN(capacity) || !capacity) {
    return next({
      status: 400,
      message:
        "Required property capacity is missing or zero. Must be a number greater than zero.",
    });
  }
  next();
}

async function tableExists(req, res, next) {
  console.log("tableExists");
  const { tableId } = req.params;
  if (tableId === undefined)
    return next({
      status: 500,
      message: "Internal error. Table id is missing",
    });
  const table = await service.read(tableId);
  console.log(table);
  if (!table)
    return next({
      status: 404,
      message: `Table not found with id: ${tableId}`,
    });
  res.locals.table = table;
  next();
}

async function create(req, res, next) {
  try {
    const table = await service.create(req.body.data);
    res.status(201).json({ data: table });
  } catch (e) {
    next({ status: 500, message: e });
  }
}
/**
 * List handler for table resources
 */
async function list(req, res) {
  const data = await service.list(res.locals.date);
  res.status(200).json({ data });
}

async function read(req, res) {
  console.log("read");
  res.json({ data: res.locals.table });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
};
