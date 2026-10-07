// Mock records are dated relative to server start so the demo always has
// upcoming, due-soon and overdue work no matter when it is run.
function daysFromNow(days, hour = 23, minute = 59) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function isPast(iso) {
  return new Date(iso).getTime() < Date.now();
}

module.exports = { daysFromNow, isPast };
