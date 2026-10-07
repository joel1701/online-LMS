const app = require('./app');

// TODO: Connect to MongoDB (mongoose.connect(process.env.MONGODB_URI)) before app.listen.
const PORT = Number(process.env.PORT) || 5050;

app.listen(PORT, () => {
  console.log(`CampusCore API running on http://localhost:${PORT}/api (in-memory mock data)`);
});
