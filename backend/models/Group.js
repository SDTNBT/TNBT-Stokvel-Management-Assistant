const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true, unique: true },
    adminEmail: { type: String, required: true },   
    treasurerEmail: { type: String, required: true }, 
    contributionAmount: { type: Number, required: true }, 
    frequency: { type: String, default: 'Monthly' },     
    creationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);

