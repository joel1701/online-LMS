// Optional artificial delay (MOCK_LATENCY_MS) so loading states can be seen during demos.
module.exports = function latency(req, res, next) {
  const ms = Number(process.env.MOCK_LATENCY_MS || 0);
  if (ms > 0) return setTimeout(next, ms);
  next();
};
