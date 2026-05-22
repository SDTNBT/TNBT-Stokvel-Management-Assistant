const BankingDetails = require('../models/BankingDetails');
const axios = require('axios');

exports.getSABanks = async (req, res) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank?country=south%20africa', {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const banks = response.data.data.map(bank => ({
      name: bank.name,
      code: bank.code,
      id: bank.id
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ success: true, data: banks });

  } catch (error) {
    console.error('Bank list error:', error.response?.data || error.message);

    const fallbackBanks = [
      { id: 1, name: 'Absa Bank Limited, South Africa', code: '632005' },
      { id: 2, name: 'African Bank Limited', code: '430000' },
      { id: 3, name: 'Capitec Bank Limited', code: '470010' },
      { id: 4, name: 'First National Bank', code: '250655' },
      { id: 5, name: 'Nedbank Limited', code: '198765' },
      { id: 6, name: 'Standard Bank of South Africa', code: '051001' }
    ];

    res.status(200).json({
      success: true,
      data: fallbackBanks,
      message: 'Using fallback South African bank list'
    });
  }
};

exports.saveBankingDetails = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder } = req.body;

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({
        success: false,
        message: 'Bank name, account holder, and account number are required'
      });
    }

    const updatedDetails = await BankingDetails.findOneAndUpdate(
      { user: req.user.uid },
      {
        user: req.user.uid,
        bankName,
        accountHolder,
        accountNumber
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedDetails,
      message: 'Banking details saved successfully'
    });

  } catch (error) {
    console.error('Banking details save error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error saving banking details'
    });
  }
};

exports.getBankingDetails = async (req, res) => {
  try {
    const details = await BankingDetails.findOne({ user: req.user.uid });

    if (!details) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bankName: details.bankName,
        accountHolder: details.accountHolder,
        accountNumber: details.accountNumber
      }
    });



  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banking details'
    });
  }
};

module.exports = {
    getSABanks,
    getBankingDetails,
    saveBankingDetails 
};