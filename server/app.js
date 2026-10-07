const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const latency = require('./middleware/latency');
const { notFoundRoute, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', latency, routes);
app.use('/api', notFoundRoute);
app.use(errorHandler);

module.exports = app;
