router.post('/paystack-webhook', async (req, res) => {
    const event = req.body;

    // 1. Verify the signature (important for security!)
    // 2. Check if payment was successful
    if (event.event === 'charge.success') {
        const { memberId, stokvelId } = event.data.metadata;
        const amountPaid = event.data.amount / 100;

        // 3. Update your MongoDB here
        // await Stokvel.findByIdAndUpdate(stokvelId, { $inc: { balance: amountPaid } });
        
        console.log(`Payment confirmed for member ${memberId}`);
    }

    res.sendStatus(200); // Always tell Paystack you received the message
});