const { HttpError } = require('../utils/httpError');

function notFoundRoute(req, res) {
  res.status(404).json({ message: `No API route for ${req.method} ${req.originalUrl}` });
}

// Express recognises error handlers by their four arguments, so `next` must stay.
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, fields: err.fields });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
}

module.exports = { notFoundRoute, errorHandler };
