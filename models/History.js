const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    situation: { type: String, required: true }, // User's input description
    situationSummary: { type: String }, // AI's summary of the situation
    officialDecision: { type: String }, // The main decision text
    infractionType: { type: String }, // e.g., "Personal Foul"
    appliedRules: [{ type: String }], // Array of rule names
    detailedReasoning: { type: String }, // Full explanation
    ruleBookReferences: [{ type: String }], // Specific article references
    penalty: { type: String }, // Consequence
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
