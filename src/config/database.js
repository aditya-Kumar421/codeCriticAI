const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codecritic';
        
        logger.info('Attempting to connect to MongoDB', { 
            uri: mongoURI.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
            database: mongoURI.split('/').pop().split('?')[0]
        });
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        logger.success('MongoDB Connected Successfully', {
            database: mongoose.connection.db.databaseName,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        });

        // Log connection events
        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error', {
                error: error.message,
                stack: error.stack
            });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected', {
                database: mongoose.connection.db?.databaseName || 'unknown'
            });
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected', {
                database: mongoose.connection.db.databaseName
            });
        });
        
    } catch (error) {
        logger.error('MongoDB Connection Error', {
            error: error.message,
            stack: error.stack,
            mongoURI: process.env.MONGODB_URI ? 'Set' : 'Not set'
        });
        process.exit(1);
    }
};

module.exports = connectDB;