// MongoDB persistence for the API.
//
// How it works:
//  1. On startup every collection is read from MongoDB into the arrays in
//     server/data/ (the arrays the services use). If the database is empty,
//     the sample data in server/data/ is inserted first.
//  2. After each API request, any document that was created, changed or
//     deleted is written back to MongoDB (upsert by key / delete by key).
//
// MongoDB is the source of truth: data survives server restarts, and the
// collections can be inspected with MongoDB Compass or mongosh.
const collections = require('./collections');
const { hashSeedPasswords } = require('../utils/password');

let enabled = false;
const snapshots = new Map(); // collection name -> Map(key -> JSON)
let writing = Promise.resolve();

const clean = (doc) => {
  const { _id, ...rest } = doc;
  return rest;
};

function takeSnapshot(entry) {
  snapshots.set(entry.name, new Map(entry.data.map((doc) => [doc[entry.key], JSON.stringify(doc)])));
}

async function insertSeed(entry) {
  if (entry.name === 'users') hashSeedPasswords(entry.data);
  if (entry.data.length) await entry.model.insertMany(entry.data.map((d) => ({ ...d })), { ordered: true });
}

// Load all collections into memory, seeding any that are empty.
async function init() {
  const seeded = [];
  for (const entry of collections) {
    await entry.model.init(); // builds indexes
    if ((await entry.model.estimatedDocumentCount()) === 0) {
      await insertSeed(entry);
      seeded.push(entry.name);
    }
    const docs = await entry.model.find({}).sort({ _id: 1 }).lean();
    entry.data.splice(0, entry.data.length, ...docs.map(clean));
    takeSnapshot(entry);
  }
  enabled = true;
  if (seeded.length) console.log(`Seeded empty collections with sample data: ${seeded.join(', ')}`);
}

// Replace the whole database with fresh sample data (used by `npm run seed`).
async function reseed() {
  for (const entry of collections) {
    await entry.model.deleteMany({});
    await entry.model.init();
    await insertSeed(entry);
    console.log(`  ${entry.name}: ${entry.data.length} documents`);
  }
}

async function writeChanges() {
  for (const entry of collections) {
    const before = snapshots.get(entry.name) || new Map();
    const after = new Map(entry.data.map((doc) => [doc[entry.key], JSON.stringify(doc)]));
    const ops = [];

    for (const [key, json] of after) {
      if (before.get(key) !== json) {
        ops.push({ replaceOne: { filter: { [entry.key]: key }, replacement: JSON.parse(json), upsert: true } });
      }
    }
    for (const key of before.keys()) {
      if (!after.has(key)) ops.push({ deleteOne: { filter: { [entry.key]: key } } });
    }

    if (ops.length) {
      // Deletes first so a re-created key does not clash with a unique index.
      ops.sort((a, b) => Number(Boolean(b.deleteOne)) - Number(Boolean(a.deleteOne)));
      await entry.model.bulkWrite(ops, { ordered: true });
      snapshots.set(entry.name, after);
    }
  }
}

// Queue a write so concurrent requests are persisted one after another.
function persist() {
  if (!enabled) return writing;
  writing = writing.then(writeChanges).catch((err) => {
    console.error('Failed to save changes to MongoDB:', err.message);
  });
  return writing;
}

// Express middleware: before a response is sent, save whatever the request
// changed, so the client only sees success once the data is in MongoDB.
function persistBeforeResponse(req, res, next) {
  if (!enabled) return next();
  const end = res.end;
  res.end = function endAfterSave(...args) {
    persist().finally(() => end.apply(res, args));
    return res;
  };
  next();
}

module.exports = { init, reseed, persist, persistBeforeResponse, isEnabled: () => enabled };
