const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    situation: { type: String, required: true },
    ruleApplied: { type: String },
    article: { type: String },
    decision: { type: String },
    penalty: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
