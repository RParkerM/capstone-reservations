function getTodayYYYYMMdd() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

module.exports = { getTodayYYYYMMdd };
