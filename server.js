const app = require('./src/app')
const logger = require('./src/utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    logger.success(`Server is running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
    console.log(`Server is running on port ${PORT}`);
})