/**
 * Returns start and end of a given yyyy-mm-dd date string in UTC
 */
const dayRange = (dateStr) => ({
  start: new Date(`${dateStr}T00:00:00.000Z`),
  end: new Date(`${dateStr}T23:59:59.999Z`),
});

/**
 * Returns today's date as yyyy-mm-dd string in UTC
 */
const todayUTC = () => new Date().toISOString().split('T')[0];

module.exports = { dayRange, todayUTC };