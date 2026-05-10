const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Payment = require('../models/Payment');

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        const apiKey = process.env.STRIPE_SECRET_KEY;

        if (!apiKey) {
            console.error("❌ ERROR: STRIPE_SECRET_KEY is undefined");
            return res.status(500).json({ error: "Stripe Key missing" });
        }

        const stripe = new Stripe(apiKey);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.floor(amount * 100), 
            currency: 'zar',
            automatic_payment_methods: { enabled: true },
        });

        res.status(200).send({ clientSecret: paymentIntent.client_secret });
        console.log(`✅ Success: PaymentIntent created for R${amount}`);
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- UPDATED SAVE-SUCCESS ROUTE ---
router.post('/save-success', async (req, res) => {
    // 1. Destructure userEmail and userId from the request body
    const { 
        transactionId, 
        amount, 
        groupName, 
        payerName, 
        userEmail, 
        userId, 
        zipCode 
    } = req.body;

    try {
        // 2. Create the record in MongoDB
        const newPayment = await Payment.create({
            transactionId,
            amount,
            groupName,
            payerName,
            userEmail, // Added
            userId,    // Added
            zipCode,
            status: 'Confirmed',
            date: new Date()
        });

        // 3. UPDATED CONSOLE LOGS for visibility
        console.log('-------------------------------------------');
        console.log('✅ NEW PAYMENT RECORDED IN DATABASE');
        console.log(`👤 Payer: ${payerName}`);
        console.log(`📧 Email: ${userEmail}`);       // Added visibility
        console.log(`🆔 UserID: ${userId}`);        // Added visibility
        console.log(`💰 Amount: R ${amount}`);
        console.log(`📂 Group: ${groupName}`);
        console.log(`🧾 Stripe ID: ${transactionId}`);
        console.log('-------------------------------------------');

        res.status(200).json({ message: 'Payment recorded successfully', data: newPayment });
    } catch (error) {
        console.error('❌ DATABASE ERROR:', error.message);
        res.status(500).json({ message: 'Failed to record payment', error: error.message });
    }
});

module.exports = router;