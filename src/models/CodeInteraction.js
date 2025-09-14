const mongoose = require('mongoose');

const codeInteractionSchema = new mongoose.Schema({
    userCode: {
        type: String,
        required: true,
        trim: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    userIP: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    responseTime: {
        type: Number, // in milliseconds
        default: 0
    },
    codeLanguage: {
        type: String,
        default: 'unknown'
    },
    sessionId: {
        type: String,
        default: ''
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt automatically
    collection: 'code_interactions' // Explicitly specify collection name
});

// Index for performance
codeInteractionSchema.index({ userIP: 1, timestamp: -1 });
codeInteractionSchema.index({ timestamp: -1 });

const CodeInteraction = mongoose.model('CodeInteraction', codeInteractionSchema);

module.exports = CodeInteraction;