require('dotenv').config();
const app = require('./app');
const store = require('./db/store');
const { connectDatabase } = require('./config/db');
const { hashSeedPasswords } = require('./utils/password');

const PORT = Number(process.env.PORT) || 5050;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (MONGODB_URI) {
    await connectDatabase(MONGODB_URI);
    await store.init();
  } else {
    // No database configured: run on the sample data in memory (changes are lost on restart).
    hashSeedPasswords(require('./data/users'));
    console.warn('MONGODB_URI is not set – running on in-memory sample data. See server/.env.example.');
  }

  app.listen(PORT, () => {
    console.log(`CampusCore API running on http://localhost:${PORT}/api (${store.isEnabled() ? 'MongoDB' : 'in-memory data'})`);
  });
}

start().catch((err) => {
  console.error('Could not start the API:', err.message);
  if (MONGODB_URI) console.error('Check that MongoDB is running and that MONGODB_URI in server/.env is correct.');
  process.exit(1);
});
