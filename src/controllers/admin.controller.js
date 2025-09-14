const CodeInteraction = require('../models/CodeInteraction');
const { v4: uuidv4 } = require('uuid');

// Get statistics about stored interactions
module.exports.getStats = async (req, res) => {
    const requestId = uuidv4();
    console.log(`Processing admin stats request - RequestId: ${requestId}, Endpoint: GET /admin/stats`);
    
    try {
        console.log(`Database operation: aggregate on code_interactions for getStats - RequestId: ${requestId}`);
        
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

        console.log(`Admin stats retrieved successfully - RequestId: ${requestId}, TotalInteractions: ${totalInteractions}, UniqueUsers: ${uniqueIPs.length}, TodayInteractions: ${todayInteractions}, LanguageStatsCount: ${languageStats.length}`);

        res.json({
            success: true,
            stats,
            requestId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Admin stats error - RequestId: ${requestId}, Error: ${error.message}, Endpoint: GET /admin/stats`);
        console.error(`Stack trace:`, error.stack);
        
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch statistics",
            message: error.message,
            requestId
        });
    }
};

// Get recent interactions (with pagination)
module.exports.getRecentInteractions = async (req, res) => {
    const requestId = uuidv4();
    console.log(`Processing admin recent interactions request - RequestId: ${requestId}, Endpoint: GET /admin/interactions, Query:`, req.query);
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log(`Database operation: find on code_interactions for getRecentInteractions - RequestId: ${requestId}, Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

        const interactions = await CodeInteraction.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .select('userIP codeLanguage timestamp responseTime userCode aiResponse')
            .lean();

        const total = await CodeInteraction.countDocuments();
        const totalPages = Math.ceil(total / limit);

        console.log(`Recent interactions retrieved successfully - RequestId: ${requestId}, InteractionsFound: ${interactions.length}, Page: ${page}, TotalPages: ${totalPages}, TotalItems: ${total}`);

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
        console.error(`Recent interactions error - RequestId: ${requestId}, Error: ${error.message}, Endpoint: GET /admin/interactions, Query:`, req.query);
        console.error(`Stack trace:`, error.stack);
        
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch interactions",
            message: error.message,
            requestId
        });
    }
};

// Get interactions by IP
module.exports.getInteractionsByIP = async (req, res) => {
    const requestId = uuidv4();
    console.log(`Processing admin interactions by IP request - RequestId: ${requestId}, Endpoint: GET /admin/interactions/ip/:ip, TargetIP: ${req.params.ip}, Query:`, req.query);
    
    try {
        const { ip } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log(`Database operation: find on code_interactions for getInteractionsByIP - RequestId: ${requestId}, TargetIP: ${ip}, Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

        const interactions = await CodeInteraction.find({ userIP: ip })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CodeInteraction.countDocuments({ userIP: ip });

        console.log(`Interactions by IP retrieved successfully - RequestId: ${requestId}, TargetIP: ${ip}, InteractionsFound: ${interactions.length}, TotalForIP: ${total}, Page: ${page}`);

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
        console.error(`IP interactions error - RequestId: ${requestId}, TargetIP: ${req.params.ip}, Error: ${error.message}, Endpoint: GET /admin/interactions/ip/:ip, Query:`, req.query);
        console.error(`Stack trace:`, error.stack);
        
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch IP interactions",
            message: error.message,
            requestId
        });
    }
};