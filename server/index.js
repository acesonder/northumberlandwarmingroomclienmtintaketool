const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database initialization
const db = require('./database/init');

// Routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const assessmentRoutes = require('./routes/assessments');
const caseRoutes = require('./routes/cases');
const serviceRoutes = require('./routes/services');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Northumberland Warming Room Client Intake Tool API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
