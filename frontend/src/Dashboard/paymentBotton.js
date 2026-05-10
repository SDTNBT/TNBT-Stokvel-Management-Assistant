import React, { useState } from 'react';
import axios from 'axios';

const PaymentButton = ({ amount, email, memberId }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/payment/initialize', {
                email,
                amount,
                memberId
            });
            
            // Redirect the user to Paystack's secure checkout
            if (data.status) {
                window.location.href = data.data.authorization_url;
            }
        } catch (err) {
            console.error("Payment Error:", err);
            alert("Could not initialize payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button className="payment-btn" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : `Contribute R${amount}`}
        </button>
    );
};

export default PaymentButton;