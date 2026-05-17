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

// COMPLIANCE REPORT ENDPOINT
router.get('/compliance/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;
        const { groupName } = req.query;
        
        if (!userEmail) {
            return res.status(400).json({ error: "User email is required" });
        }

        const query = { userEmail: userEmail.toLowerCase() };
        if (groupName) {
            query.groupName = groupName;
        }
        
        const payments = await Payment.find(query).sort({ date: 1 });
        
        const Member = require('../models/Member');
        const member = await Member.findOne({ user: userEmail.toLowerCase(), group: groupName });
        
        const joinDate = member ? new Date(member.joiningDate) : new Date();
        const currentDate = new Date();
        
        const monthsSinceJoin = (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + 
                                 (currentDate.getMonth() - joinDate.getMonth()) + 1;
        const totalExpected = Math.max(monthsSinceJoin, 1);
        
        const totalPaid = payments.length;
        const missedPayments = totalExpected - totalPaid;
        const complianceRate = Math.round((totalPaid / totalExpected) * 100);
        
        const onTimePayments = payments.filter(p => {
            const paymentDate = new Date(p.date);
            const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 15);
            return paymentDate <= expectedDate;
        }).length;
        
        const onTimeRate = totalPaid > 0 ? Math.round((onTimePayments / totalPaid) * 100) : 0;
        
        const monthlyBreakdown = [];
        const startDate = new Date(joinDate);
        startDate.setDate(1);
        
        for (let i = 0; i < totalExpected; i++) {
            const currentMonth = new Date(startDate);
            currentMonth.setMonth(startDate.getMonth() + i);
            const monthName = currentMonth.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
            const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15);
            
            const paymentForMonth = payments.find(p => {
                const pDate = new Date(p.date);
                return pDate.getMonth() === currentMonth.getMonth() && 
                       pDate.getFullYear() === currentMonth.getFullYear();
            });
            
            let status = 'missed';
            let amount = 0;
            if (paymentForMonth) {
                const paymentDate = new Date(paymentForMonth.date);
                status = paymentDate <= dueDate ? 'on-time' : 'late';
                amount = paymentForMonth.amount;
            }
            
            monthlyBreakdown.push({
                month: monthName,
                expected: 0,
                paid: amount,
                dueDate: dueDate.toLocaleDateString('en-ZA'),
                paymentDate: paymentForMonth ? paymentForMonth.date : null,
                status: status
            });
        }
        
        res.status(200).json({
            success: true,
            complianceRate: complianceRate,
            totalExpected: totalExpected,
            totalPaid: totalPaid,
            missedPayments: missedPayments,
            latePayments: totalPaid - onTimePayments,
            onTimeRate: onTimeRate,
            monthlyBreakdown: monthlyBreakdown,
            joinDate: joinDate,
            lastPaymentDate: payments.length > 0 ? payments[payments.length - 1].date : null
        });
        
    } catch (error) {
        console.error("Error fetching compliance data:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
