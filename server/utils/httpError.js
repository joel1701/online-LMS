class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    if (fields) this.fields = fields;
  }
}

const badRequest = (message, fields) => new HttpError(400, message, fields);
const unauthorized = (message = 'Please sign in to continue.') => new HttpError(401, message);
const forbidden = (message = 'You do not have access to this resource.') => new HttpError(403, message);
const notFound = (what = 'Resource') => new HttpError(404, `${what} not found.`);
const conflict = (message) => new HttpError(409, message);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
