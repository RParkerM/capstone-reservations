function isYYYYMMDD(string) {
  return /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(string);
}
function is24HrTime(string) {
  return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(string);
}

module.exports = { isYYYYMMDD, is24HrTime };
