const Payout = require('../models/Payout');

const schedulePayout = async (req, res) => {
    try {
        const { groupName, userId, userEmail, amount, payoutDate } = req.body;

        // Rule 2: Validation for zero or negative amounts
        if (amount <= 0) {
            return res.status(400).json({ message: 'Payout amount must be greater than zero' });
        }

        // Rule 1: Create the payout
        const newPayout = new Payout({
            groupName,
            userId,
            userEmail,
            amount,
            payoutDate,
            status: 'Scheduled' // Default status
        });

        await newPayout.save();

        res.status(201).json({
            message: 'Payout scheduled successfully',
            payout: newPayout
        });
        
    } catch (error) {
        console.error('Error scheduling payout:', error);
        res.status(500).json({ message: 'Server error while scheduling payout' });
    }
};

module.exports = {
    schedulePayout
};