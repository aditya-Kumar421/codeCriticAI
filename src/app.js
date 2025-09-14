const express = require('express');
const path = require('path');
const aiRoutes = require('./routes/ai.routes');
const streamingRoutes = require('./routes/ai.streaming.routes');
const adminRoutes = require('./routes/admin.routes');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());

// Trust proxy for correct IP detection when behind reverse proxy (like Vercel)
app.set('trust proxy', true);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json())

// Log application startup
console.log(`CodeCritic AI Application Starting - NodeVersion: ${process.version}, Platform: ${process.platform}, Environment: ${process.env.NODE_ENV || 'development'}`);

app.get('/', (req, res) => {
    console.log(`Root endpoint accessed - IP: ${req.ip}`);
    res.send('Hello, World! CodeCritic AI is running.');
});

app.use('/ai', aiRoutes);
app.use('/ai', streamingRoutes);
app.use('/admin', adminRoutes);

module.exports = app;