function getTodayYYYYMMdd() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function getLocalTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date;
}

function isTuesday(date) {
  return date.getDay() == 2;
}

module.exports = { getTodayYYYYMMdd, getLocalTime, isTuesday };
