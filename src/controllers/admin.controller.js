const CodeInteraction = require('../models/CodeInteraction');
const logger = require('../utils/logger');
const { asyncErrorHandler } = require('../middleware/logging');
const { v4: uuidv4 } = require('uuid');

// Get statistics about stored interactions
module.exports.getStats = asyncErrorHandler(async (req, res) => {
    const requestId = uuidv4();
    logger.info('Processing admin stats request', { requestId, endpoint: 'GET /admin/stats' });
    
    try {
        logger.logDatabaseOperation('aggregate', 'code_interactions', { operation: 'getStats' });
        
        const totalInteractions = await CodeInteraction.countDocuments();
        const uniqueIPs = await CodeInteraction.distinct('userIP');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayInteractions = await CodeInteraction.countDocuments({
            timestamp: { $gte: todayStart }
        });

        const languageStats = await CodeInteraction.aggregate([
            {
                $group: {
                    _id: '$codeLanguage',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const avgResponseTime = await CodeInteraction.aggregate([
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$responseTime' }
                }
            }
        ]);

        const stats = {
            totalInteractions,
            uniqueUsers: uniqueIPs.length,
            todayInteractions,
            languageStats,
            averageResponseTime: avgResponseTime[0]?.avgTime || 0
        };

        logger.success('Admin stats retrieved successfully', {
            requestId,
            statsGenerated: {
                totalInteractions,
                uniqueUsers: uniqueIPs.length,
                todayInteractions,
                languageStatsCount: languageStats.length
            }
        });

        res.json({
            success: true,
            stats,
            requestId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Admin stats error', {
            requestId,
            error: error.message,
            stack: error.stack,
            endpoint: 'GET /admin/stats'
        });
        
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch statistics",
            message: error.message,
            requestId
        });
    }
});

// Get recent interactions (with pagination)
module.exports.getRecentInteractions = asyncErrorHandler(async (req, res) => {
    const requestId = uuidv4();
    logger.info('Processing admin recent interactions request', { 
        requestId, 
        endpoint: 'GET /admin/interactions',
        query: req.query 
    });
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        logger.logDatabaseOperation('find', 'code_interactions', { 
            operation: 'getRecentInteractions', 
            page, 
            limit, 
            skip 
        });

        const interactions = await CodeInteraction.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .select('userIP codeLanguage timestamp responseTime userCode aiResponse')
            .lean();

        const total = await CodeInteraction.countDocuments();
        const totalPages = Math.ceil(total / limit);

        logger.success('Recent interactions retrieved successfully', {
            requestId,
            interactionsFound: interactions.length,
            page,
            totalPages,
            totalItems: total
        });

        res.json({
            success: true,
            data: {
                interactions: interactions.map(interaction => ({
                    ...interaction,
                    userCode: interaction.userCode.substring(0, 200) + (interaction.userCode.length > 200 ? '...' : ''),
                    aiResponse: interaction.aiResponse.substring(0, 300) + (interaction.aiResponse.length > 300 ? '...' : '')
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            },
            requestId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Recent interactions error', {
            requestId,
            error: error.message,
            stack: error.stack,
            endpoint: 'GET /admin/interactions',
            query: req.query
        });
        
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch interactions",
            message: error.message,
            requestId
        });
    }
});

// Get interactions by IP
module.exports.getInteractionsByIP = asyncErrorHandler(async (req, res) => {
    const requestId = uuidv4();
    logger.info('Processing admin interactions by IP request', { 
        requestId, 
        endpoint: 'GET /admin/interactions/ip/:ip',
        targetIP: req.params.ip,
        query: req.query 
    });
    
    try {
        const { ip } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        logger.logDatabaseOperation('find', 'code_interactions', { 
            operation: 'getInteractionsByIP', 
            targetIP: ip,
            page, 
            limit, 
            skip 
        });

        const interactions = await CodeInteraction.find({ userIP: ip })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CodeInteraction.countDocuments({ userIP: ip });

        logger.success('Interactions by IP retrieved successfully', {
            requestId,
            targetIP: ip,
            interactionsFound: interactions.length,
            totalForIP: total,
            page
        });

        res.json({
            success: true,
            data: {
                ip,
                interactions,
                totalInteractions: total,
                pagination: {
                    currentPage: page,
                    totalItems: total,
                    itemsPerPage: limit
                }
            },
            requestId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('IP interactions error', {
            requestId,
            targetIP: req.params.ip,
            error: error.message,
            stack: error.stack,
            endpoint: 'GET /admin/interactions/ip/:ip',
            query: req.query
        });
        
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch IP interactions",
            message: error.message,
            requestId
        });
    }
});