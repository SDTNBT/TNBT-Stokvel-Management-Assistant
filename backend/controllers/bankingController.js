const BankingDetails = require('../models/BankingDetails');
const axios = require('axios');

exports.getSABanks = async (req, res) => {
  try {
    // Fetching from Paystack's public metadata for South Africa
    const response = await axios.get('https://api.paystack.co/bank?country=south%20africa', {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });
    
    // Paystack returns an array of bank objects { name, code, slug, etc. }
    const banks = response.data.data.map(bank => ({
      name: bank.name,
      code: bank.code, // Useful for future EFT integrations
      id: bank.id
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ success: true, data: banks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch bank list" });
  }
};

exports.saveBankingDetails = async (req, res) => {
  try {
    const { bankName, accountNumber, idNumber, accountHolder } = req.body;

    // 1. Find the Bank Code
    const bankListRes = await axios.get('https://api.paystack.co/bank?country=south%20africa', {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const selectedBank = bankListRes.data.data.find(b => b.name === bankName);

    if (!selectedBank) {
        return res.status(400).json({ success: false, message: "Invalid bank selected" });
    }

    // 2. Validate with Paystack (Required for SA)
    const verifyRes = await axios.post(`https://api.paystack.co/bank/validate`,
      {
        bank_code: selectedBank.code,
        country_code: "ZA",
        account_number: accountNumber,
        account_name: accountHolder, // Use the name from the frontend
        account_type: "personal",
        document_type: "identityNumber",
        document_number: idNumber 
      },
      { 
        headers: { 
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    // Paystack Test Mode returns data.data.verified
    if (verifyRes.data.data.verified === false) {
      return res.status(400).json({ success: false, message: "Bank details could not be verified by Paystack." });
    }

    // 3. UPSERT Logic (Update or Insert)
    // We search by req.user.uid (from Firebase)
    // If found, we update. If not, we create.
    const updatedDetails = await BankingDetails.findOneAndUpdate(
      { user: req.user.uid }, // Match criteria
      { 
        bankName, 
        accountHolder, 
        accountNumber 
      },
      { 
        returnDocument: 'after',      // Return the updated document
        upsert: true,   // Create it if it doesn't exist
        runValidators: true 
      }
    );

    // Determine if it was an update or a new save for the message
    const isUpdate = updatedDetails.createdAt < updatedDetails.updatedAt;

    res.status(200).json({ 
      success: true, 
      data: updatedDetails, 
      message: isUpdate ? "Banking details updated successfully" : "Banking details saved successfully"
    });

  } catch (error) {
    console.error("Paystack/DB Error:", error.response?.data || error.message);
    res.status(400).json({ 
      success: false, 
      message: error.response?.data?.message || "Verification failed. Please check your account details." 
    });
  }
};

// Add this to your existing exports in bankingController.js
exports.getBankingDetails = async (req, res) => {
  console.log("!!! THE REQUEST REACHED THE CONTROLLER !!!");
  try {
    console.log("1. Incoming request from User UID:", req.user?.uid);
    // req.user.uid comes from your verifyFirebaseToken middleware
    const details = await BankingDetails.findOne({ user: req.user.uid });

    console.log("2. Database found:", details);

    if (!details) {
      
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        bankName: details.bankName,
        accountNumber: details.accountNumber
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching banking details" });
  }
};