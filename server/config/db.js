const mongoose = require('mongoose');

async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const { host, port, name } = mongoose.connection;
  console.log(`Connected to MongoDB at ${host}:${port}/${name}`);
  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
