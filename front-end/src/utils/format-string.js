/**
 * Capitalizes first letter of string and then returns it.
 * @param {string} string
 * @returns {string}
 * String with first letter uppercase
 */
export default function capitalizeFirstLetter(string) {
  if (typeof string !== "string") return string;
  return string[0].toUpperCase() + string.slice(1);
}
