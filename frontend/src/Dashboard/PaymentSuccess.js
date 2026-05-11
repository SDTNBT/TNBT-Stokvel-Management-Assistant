import React from 'react';
import { CheckCircle } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = ({ transactionId, onReturn }) => {
  // Fallback function to ensure the button ALWAYS does something
  const handleReturn = () => {
    if (typeof onReturn === 'function') {
      onReturn();
    } else {
      // If the parent didn't pass a function, this will at least 
      // reset the page so the user isn't stuck.
      window.location.reload();
    }
  };

  return (
    <section className="success-page-wrapper">
      <article className="success-content">
        <header className="success-header">
          <figure className="success-icon-wrapper">
            <CheckCircle size={80} strokeWidth={1.5} />
          </figure>
          <h1>Payment Successful!</h1>
          <p>Thank you for your contribution.</p>
        </header>

        <section className="transaction-details">
          <p className="label">Transaction Reference:</p>
          <p className="reference-number">{transactionId}</p>
        </section>

        <footer className="success-footer">
          <button 
            onClick={handleReturn} 
            className="btn-return-dashboard"
            style={{ cursor: 'pointer' }}
          >
            Return to Payment dashboard
          </button>
        </footer>
      </article>
    </section>
  );
};

export default PaymentSuccess;