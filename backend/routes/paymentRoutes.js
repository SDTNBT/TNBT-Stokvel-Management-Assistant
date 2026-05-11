const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Payment = require('../models/Payment');

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        const apiKey = process.env.STRIPE_SECRET_KEY;

        if (!apiKey) {
            console.error("ERROR: STRIPE_SECRET_KEY is undefined");
            return res.status(500).json({ error: "Stripe Key missing" });
        }

        const stripe = new Stripe(apiKey);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.floor(amount * 100), 
            currency: 'zar',
            automatic_payment_methods: { enabled: true },
        });

        res.status(200).send({ clientSecret: paymentIntent.client_secret });
        console.log(`Success: PaymentIntent created for R${amount}`);
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/save-success', async (req, res) => {
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
        const newPayment = await Payment.create({
            transactionId,
            amount,
            groupName,
            payerName,
            userEmail: userEmail.toLowerCase(),
            userId,
            zipCode,
            status: 'Confirmed',
            date: new Date()
        });

        console.log('-------------------------------------------');
        console.log('NEW PAYMENT RECORDED IN DATABASE');
        console.log(`Payer: ${payerName}`);
        console.log(`Email: ${userEmail}`);
        console.log(`UserID: ${userId}`);
        console.log(`Amount: R ${amount}`);
        console.log(`Group: ${groupName}`);
        console.log(`Stripe ID: ${transactionId}`);
        console.log('-------------------------------------------');

        res.status(200).json({ message: 'Payment recorded successfully', data: newPayment });
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
        res.status(500).json({ message: 'Failed to record payment', error: error.message });
    }
});

router.post('/record-payment', async (req, res) => {
    const { 
        amount, 
        groupName, 
        payerName, 
        userEmail, 
        userId, 
        paymentMethod, 
        status,
        date 
    } = req.body;

    try {
        const transactionId = `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        const newPayment = await Payment.create({
            transactionId,
            amount,
            groupName,
            payerName,
            userEmail: userEmail.toLowerCase(),
            userId,
            paymentMethod: paymentMethod || 'manual',
            status: status || 'Pending',
            date: date || new Date()
        });

        console.log('-------------------------------------------');
        console.log('MANUAL PAYMENT RECORDED');
        console.log(`Payer: ${payerName}`);
        console.log(`Email: ${userEmail}`);
        console.log(`Amount: R${amount}`);
        console.log(`Group: ${groupName}`);
        console.log(`Method: ${paymentMethod}`);
        console.log(`Status: ${status || 'Pending'}`);
        console.log('-------------------------------------------');

        res.status(200).json({ 
            message: 'Payment recorded successfully', 
            data: newPayment 
        });
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
        res.status(500).json({ message: 'Failed to record payment', error: error.message });
    }
});

router.get('/my-payments/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;
        
        if (!userEmail) {
            return res.status(400).json({ error: "User email is required" });
        }

        const payments = await Payment.find({ userEmail: userEmail.toLowerCase() })
            .sort({ date: -1 });

        console.log(`Found ${payments.length} payments for user: ${userEmail}`);
        
        res.status(200).json({ 
            success: true, 
            payments: payments,
            count: payments.length
        });
    } catch (error) {
        console.error("Error fetching payment history:", error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/my-payments-summary/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;
        
        if (!userEmail) {
            return res.status(400).json({ error: "User email is required" });
        }

        const payments = await Payment.find({ userEmail: userEmail.toLowerCase() });
        
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const lastPayment = payments.length > 0 ? payments[0] : null;
        const uniqueGroups = [...new Set(payments.map(p => p.groupName))];

        res.status(200).json({
            success: true,
            summary: {
                totalPaid: totalPaid,
                totalPayments: payments.length,
                uniqueGroups: uniqueGroups.length,
                lastPaymentDate: lastPayment ? lastPayment.date : null,
                lastPaymentAmount: lastPayment ? lastPayment.amount : 0
            }
        });
    } catch (error) {
        console.error("Error fetching payment summary:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
