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

// 1. Get the next scheduled payout
// 1. Get the next scheduled payout
const getNextScheduled = async (req, res) => {
    try {
        // We take the groupName from the URL instead of groupId
        const { groupName } = req.params;

        // Find the earliest scheduled payout for this group
        const nextPayout = await Payout.findOne({ 
            groupName: groupName, 
            status: 'Scheduled' 
        }).sort({ payoutDate: 1 }); // 1 means ascending (closest date first!)

        if (!nextPayout) {
            return res.status(404).json({ message: 'No upcoming payouts scheduled.' });
        }

        // Send back the raw data from the DB document
        res.status(200).json({
            memberEmail: nextPayout.userEmail, // e.g., "bottlejob101@gmail.com"
            memberId: nextPayout.userId,       // e.g., "2121"
            expectedAmount: nextPayout.amount, // e.g., 650
            payoutDate: nextPayout.payoutDate  // e.g., "2026-05-17T..."
        });
    } catch (error) {
        console.error("Error fetching next payout:", error);
        res.status(500).json({ message: 'Server error fetching schedule' });
    }
};

// 2. Get active pending payouts for your table
const getPendingPayouts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const pendingPayouts = await Payout.find({ status: 'pending' }); // Add groupId filter if needed
        res.status(200).json(pendingPayouts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pending payouts' });
    }
};

// 3. Initiate the payout (Your POST action)
const initiatePayout = async (req, res) => {
    try {
        // ✅ Added payoutDate, groupName, and userId to match what React is sending
        const { groupName, userId, recipientEmail, amount, method, reference, notes, payoutDate } = req.body;

        const newPayout = new Payout({
            groupName, 
            userId, 
            userEmail: recipientEmail, // Maps recipientEmail from frontend to userEmail for DB
            amount,
            payoutDate, // ✅ Added so the database stops complaining!
            method,
            reference,
            notes,
            status: 'pending' 
        });

        await newPayout.save();
        res.status(201).json(newPayout);
    } catch (error) {
        console.error('Error initiating payout:', error);
        res.status(500).json({ message: 'Server error initiating payout', error: error.message });
    }
};
// --- NEW: Fetch Scheduled Payouts for the Dashboard ---
const getScheduledPayouts = async (req, res) => {
    try {
        // Find all payouts that haven't been paid out yet
        const payouts = await Payout.find({ status: 'Scheduled' });
        res.status(200).json(payouts);
    } catch (error) {
        console.error("Error fetching scheduled payouts:", error);
        res.status(500).json({ message: "Failed to fetch scheduled payouts" });
    }
    
};

module.exports = {
    schedulePayout,
    updatePayoutStatus,
    getNextScheduled, // <-- Added this
    getPendingPayouts, // <-- Added this
    initiatePayout, // <-- Added this
    getScheduledPayouts // <-- Don't forget to export the new function!
};