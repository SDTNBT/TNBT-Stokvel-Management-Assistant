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

const updatePayoutStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find the payout by ID and update its status
        const updatedPayout = await Payout.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true } // This tells Mongoose to return the updated document, not the old one
        );

        // If the ID doesn't exist, return our 404 error
        if (!updatedPayout) {
            return res.status(404).json({ message: 'Payout not found' });
        }

        // If it worked, return the 200 success
        res.status(200).json({
            message: 'Payout status updated successfully',
            payout: updatedPayout
        });

    } catch (error) {
        console.error('Error updating payout:', error);
        res.status(500).json({ message: 'Server error while updating payout' });
    }
};

module.exports = {
    schedulePayout,
    updatePayoutStatus
};