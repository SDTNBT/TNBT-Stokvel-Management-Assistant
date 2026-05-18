const Payout = require('../models/Payout');
const BankingDetails = require('../models/BankingDetails');

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

    if (!userId || !userEmail || !amount || !payoutDate) {
      return res.status(400).json({
        message: 'Please provide groupName, userId, userEmail, amount, and payoutDate'
      });
    }

    const payoutAmount = Number(amount);

    if (payoutAmount <= 0) {
      return res.status(400).json({
        message: 'Payout amount must be greater than zero'
      });
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    // Check banking details by email OR userId
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

    const newPayout = new Payout({
      groupName: groupName || null,
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

const updatePayoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Scheduled', 'Processing', 'Paid', 'Cancelled', 'Failed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid payout status'
      });
    }

    const updateData = { status };

    if (status === 'Paid') {
      updateData.paidAt = new Date();
    }

    const updatedPayout = await Payout.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedPayout) {
      return res.status(404).json({
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      message: 'Payout status updated successfully',
      payout: updatedPayout
    });

  } catch (error) {
    console.error('Error updating payout:', error);
    res.status(500).json({
      message: 'Server error while updating payout'
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
  getMemberPayouts
};