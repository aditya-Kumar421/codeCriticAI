const express = require('express');
const path = require('path');
const aiRoutes = require('./routes/ai.routes');
const streamingRoutes = require('./routes/ai.streaming.routes');
const adminRoutes = require('./routes/admin.routes');
const cors = require('cors');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { requestLogger } = require('./middleware/logging');

const app = express();

// Connect to MongoDB
connectDB();

// Logging middleware (should be early in the middleware stack)
app.use(requestLogger);

app.use(cors());

// Trust proxy for correct IP detection when behind reverse proxy (like Vercel)
app.set('trust proxy', true);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json())

// Log application startup
logger.info('CodeCritic AI Application Starting', {
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development'
});

app.get('/', (req, res) => {
    logger.info('Root endpoint accessed', { ip: req.ip });
    res.send('Hello, World! CodeCritic AI is running.');
});

app.use('/ai', aiRoutes);
app.use('/ai', streamingRoutes);
app.use('/admin', adminRoutes);

module.exports = app;