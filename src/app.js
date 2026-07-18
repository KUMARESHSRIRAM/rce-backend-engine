const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway is running smoothly.' });
});

// We will attach our Problem and Submission routes here shortly
// app.use('/api/problems', require('./routes/problemRoutes'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway is running smoothly.' });
});

// Attach the submission routes
app.use('/api/submissions', require('./routes/submissionRoutes'));

module.exports = app;