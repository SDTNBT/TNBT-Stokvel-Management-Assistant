// /backend/controllers/analyticsController.js

const Payment = require('../models/Payment');
// IMPORTANT: Make sure the path below matches your actual Payout model!
const Payout = require('../models/Payout'); 

const getMemberAnalytics = async (req, res) => {
    try {
        // 1. Get user ID dynamically (Checks JWT, Headers, or Query params to be safe!)
        const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId; 
        
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID is missing." });
        }

        // 2. Extract our filters from the query URL
        const { startDate, endDate, format } = req.query;

        // 3. Build the dynamic date query
        let dateQuery = {};
        if (startDate || endDate) {
            if (startDate) dateQuery.$gte = new Date(startDate);
            if (endDate) dateQuery.$lte = new Date(endDate);
        }

        // 4. Query BOTH collections dynamically from MongoDB
        const queryObj = Object.keys(dateQuery).length > 0 
            ? { userId: userId, date: dateQuery } 
            : { userId: userId };

        // Fetch concurrently to make it fast
        const [payments, payouts] = await Promise.all([
            Payment.find(queryObj).lean(),
            Payout.find(queryObj).lean().catch(() => []) // Catch allows it to run even if Payout model is empty/missing
        ]);

        // 5. Format and merge the data dynamically
        const formattedPayments = payments.map(p => ({
            ...p,
            type: 'Contribution',
            amount: p.amount || p.contributionAmount // Fallback depending on your schema
        }));

        const formattedPayouts = payouts.map(p => ({
            ...p,
            type: 'Payout',
            amount: p.amount || p.payoutAmount // Fallback depending on your schema
        }));

        // Merge arrays and sort by date descending (newest first)
        const allTransactions = [...formattedPayments, ...formattedPayouts].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // 6. Calculate the dynamic summary based on the actual database records!
        const summary = allTransactions.reduce((acc, curr) => {
            if (curr.type === 'Contribution') {
                acc.totalContributions += curr.amount;
            } else if (curr.type === 'Payout') {
                acc.totalPayouts += curr.amount;
            }
            return acc;
        }, { totalContributions: 0, totalPayouts: 0 });

        // 7. EXPORT LOGIC: Dynamically generate CSV rows
        if (format === 'csv') {
            let csvString = 'Date,Type,Amount\n';
            
            allTransactions.forEach(t => {
                const dateStr = new Date(t.date).toLocaleDateString();
                // Now the type is dynamic! It will say either 'Contribution' or 'Payout'
                csvString += `${dateStr},${t.type},${t.amount}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="my_financial_records.csv"');
            return res.status(200).send(csvString);
        }

        // 8. Send the fully dynamic JSON back to React
        res.status(200).json({
            summary,
            transactions: allTransactions
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Failed to dynamically fetch analytics" });
    }
};

module.exports = {
    getMemberAnalytics
};