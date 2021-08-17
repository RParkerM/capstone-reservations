const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const data = await service.list("2020-12-31");
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
};
