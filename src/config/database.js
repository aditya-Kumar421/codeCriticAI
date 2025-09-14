const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codecritic';
        
        console.log(`Attempting to connect to MongoDB - Database: ${mongoURI.split('/').pop().split('?')[0]}`);
        
        await mongoose.connect(mongoURI);
        
        console.log(`MongoDB Connected Successfully - Database: ${mongoose.connection.db.databaseName}, Host: ${mongoose.connection.host}, Port: ${mongoose.connection.port}`);

        // Log connection events
        mongoose.connection.on('error', (error) => {
            console.error(`MongoDB connection error: ${error.message}`);
            console.error('Stack trace:', error.stack);
        });

        mongoose.connection.on('disconnected', () => {
            console.log(`MongoDB disconnected - Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
        });

        mongoose.connection.on('reconnected', () => {
            console.log(`MongoDB reconnected - Database: ${mongoose.connection.db.databaseName}`);
        });
        
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Stack trace:', error.stack);
        console.error(`MongoDB URI status: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
        process.exit(1);
    }
};

module.exports = connectDB;