// Shared options for every collection.
// - `id` is the application key used across the API (the frontend relies on it),
//   so MongoDB's own `_id` is kept internal and hidden from JSON output.
// - `strict: false` keeps any extra fields a service adds, so nothing is silently dropped.
module.exports = {
  versionKey: false,
  strict: false,
  minimize: false,
  toJSON: {
    transform(_doc, ret) {
      delete ret._id;
      return ret;
    },
  },
};
