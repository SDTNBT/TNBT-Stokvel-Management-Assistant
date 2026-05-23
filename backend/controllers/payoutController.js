const Payout = require('../models/Payout');
const BankingDetails = require('../models/BankingDetails');
const Member = require('../models/Member');

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

// ==========================================
// HELPER
// ==========================================

const generatePaymentReference = () => {
  return `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// ==========================================
// TREASURER: Schedule a Payout
// ==========================================

const schedulePayout = async (req, res) => {
  try {
    const { groupName, userId, userEmail, amount, payoutDate } = req.body;

    // Validate required fields
    if (!groupName || !userId || !userEmail || !amount || !payoutDate) {
      return res.status(400).json({
        message: 'Please provide groupName, userId, userEmail, amount, and payoutDate'
      });
    }

    const payoutAmount = Number(amount);

    // Rule: amount must be positive
    if (payoutAmount <= 0) {
      return res.status(400).json({
        message: 'Payout amount must be greater than zero'
      });
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    // =====================================================
    // STEP 1: CHECK IF USER IS A MEMBER OF THIS GROUP
    // =====================================================
    const memberExists = await Member.findOne({
      user: cleanEmail,
      group: groupName
    });

    if (!memberExists) {
      return res.status(400).json({
        message: 'This user is not a member of the selected group.'
      });
    }

    // =====================================================
    // STEP 2: CHECK BANKING DETAILS
    // =====================================================
    const bankingDetails = await BankingDetails.findOne({
      $or: [
        { user: cleanEmail },
        { user: userId }
      ]
    });

    if (!bankingDetails) {
      return res.status(400).json({
        message: 'Cannot schedule payout. This member has not saved banking details yet.'
      });
    }

    const accountNumber = bankingDetails.accountNumber || '';
    const accountNumberLast4 = accountNumber.slice(-4);

    // =====================================================
    // STEP 3: CREATE PAYOUT
    // =====================================================
    const newPayout = new Payout({
      groupName,
      userId,
      userEmail: cleanEmail,
      amount: payoutAmount,
      payoutDate,
      status: 'Scheduled',
      bankName: bankingDetails.bankName,
      accountHolder: bankingDetails.accountHolder,
      accountNumberLast4,
      paymentReference: generatePaymentReference()
    });

    await newPayout.save();

    res.status(201).json({
      message: 'Payout scheduled successfully and linked to member banking details',
      payout: newPayout
    });

  } catch (error) {
    console.error('Error scheduling payout:', error);
    res.status(500).json({
      message: 'Server error while scheduling payout'
    });
  }
};

// ==========================================
// TREASURER: Update Payout Status
// ==========================================

// ── Update payout status (Paid / Failed) ───────────────────────────────
  // ==========================================
// TREASURER: Update Payout Status
// ==========================================

const updatePayoutStatus = async (req, res) => {
  try {
    // 1. Get the ID from the URL and the new status from the request body
    // Using || handles both /:id/status and /:payoutId/status route definitions
    const payoutId = req.params.id || req.params.payoutId; 
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    // 2. Update the payout in MongoDB
    // Note: We use .toLowerCase() here in case your schema expects 'paid' instead of 'Paid'
    const updatedPayout = await Payout.findByIdAndUpdate(
      payoutId,
      { status: status.toLowerCase() }, 
      { new: true } // This tells Mongoose to return the updated document
    );

    if (!updatedPayout) {
      return res.status(404).json({ message: 'Payout not found.' });
    }

    // 3. Send success response back to React
    return res.status(200).json({ 
      message: 'Status updated successfully', 
      payout: updatedPayout 
    });

  } catch (error) {
    console.error("Error updating payout status:", error);
    return res.status(500).json({ 
      message: 'Could not update status.', 
      error: error.message 
    });
  }
};

// ==========================================
// TREASURER: Get All Scheduled Payouts
// ==========================================

const getScheduledPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ status: 'Scheduled' });
    res.status(200).json(payouts);
  } catch (error) {
    console.error('Error fetching scheduled payouts:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled payouts' });
  }
};

// ==========================================
// MEMBER: Get Payout History by Email
// ==========================================

const getMemberPayouts = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const payouts = await Payout.find({
      userEmail: email.toLowerCase().trim()
    }).sort({ createdAt: -1 });

    res.status(200).json(payouts);

  } catch (error) {
    console.error('Error fetching member payouts:', error);
    res.status(500).json({ message: 'Server error while fetching payout history' });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  schedulePayout,
  updatePayoutStatus,
  getScheduledPayouts,
  getMemberPayouts,
  getNextScheduled,
  getPendingPayouts,
  initiatePayout
};
