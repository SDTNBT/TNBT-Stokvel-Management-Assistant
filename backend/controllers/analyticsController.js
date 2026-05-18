// Replace with your actual model name
const Transaction = require('../models/Payment');

const getMemberAnalytics = async (req, res) => {
    try {
        // 1. Get user ID from our simulated header (or req.user.id if using real JWT auth)
        const userId = req.headers['x-user-id'] || req.user?.id; 
        
        // 2. Extract our filters from the query URL (e.g., ?startDate=2023-01-01)
        const { startDate, endDate, format } = req.query;

        // 3. Build the database query
        let query = { userId: userId };

        // If the user provided dates, add them to the query!
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate); // Greater than or equal
            if (endDate) query.date.$lte = new Date(endDate);     // Less than or equal
        }

        // 4. Fetch the data sorted by newest first
        const transactions = await Transaction.find(query).sort({ date: -1 });

        // 5. Calculate the summary totals (Everything in this model is a Contribution!)
        const summary = transactions.reduce((acc, curr) => {
            acc.totalContributions += curr.amount;
            return acc;
        }, { totalContributions: 0, totalPayouts: 0 }); // totalPayouts is 0 for now until we link the Payout model

        // 6. EXPORT LOGIC: If they want a CSV, build it and send it as a file!
        if (format === 'csv') {
            let csvString = 'Date,Type,Amount\n';
            
            transactions.forEach(t => {
                const dateStr = new Date(t.date).toLocaleDateString();
                // We hardcode "Contribution" here because this is the Payment model
                csvString += `${dateStr},Contribution,${t.amount}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="my_financial_records.csv"');
            return res.status(200).send(csvString);
        }

        // 7. Standard JSON response for the React Dashboard
        res.status(200).json({
            summary,
            transactions
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};

module.exports = {
    getMemberAnalytics
};