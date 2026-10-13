// Resets the database to the sample data in server/data/.
// Usage: npm run seed   (from the server folder)
// Dates in the sample data are relative to today, so re-seed before a demo
// to make deadlines and open tests line up with the current date.
require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('../config/db');
const store = require('../db/store');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Copy server/.env.example to server/.env first.');
    process.exit(1);
  }
  await connectDatabase(uri);
  console.log('Replacing all collections with sample data…');
  await store.reseed();
  await disconnectDatabase();
  console.log('Done.');
}

main().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
