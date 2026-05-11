const API_URL = 'http://localhost:5000/api/payouts'; // Make sure this matches your Express port!

export const schedulePayout = async (payoutData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // This is our VIP pass to get past the bouncer we just built!
                'x-user-role': 'Treasurer' 
            },
            body: JSON.stringify(payoutData)
        });

        const data = await response.json();

        // If the server throws a 400 or 403, we catch it here
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong scheduling the payout');
        }

        return data; // Returns the { message, payout } object from our backend
    } catch (error) {
        throw error;
    }
};