import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { ArrowLeft } from 'lucide-react';
import './PaymentGateway.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = (props) => {
  // Added userEmail to the destructured props
  const { amount, onBack, onSuccess, groupName, userId, userEmail } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (zipCode.length !== 5) {
      alert("Please enter a valid 5-digit ZIP code.");
      return;
    }

    setProcessing(true);

    try {
      // 1. Create the Payment Intent
      // Use your Render URL for consistency with Home.js
      const apiUrl = 'http://localhost:5000/api/payments';
      
      const response = await fetch(`${apiUrl}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      const { clientSecret } = await response.json();

      // 2. Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { 
            name: cardholderName,
            address: { postal_code: zipCode },
            email: userEmail // Optional: Passes email to Stripe for their records
          },
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        
        // 3. Save to database with FULL identification
        try {
          await fetch(`${apiUrl}/save-success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transactionId: result.paymentIntent.id,
              amount: amount,
              payerName: cardholderName,
              userEmail: userEmail, // Sent from MemberDashboard props
              userId: userId,       // Sent from MemberDashboard props
              groupName: groupName, 
              zipCode: zipCode
            }),
          });
        } catch (dbError) {
          console.error("Database recording failed:", dbError);
        }

        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      alert("An error occurred during payment. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        fontFamily: '"Public Sans", sans-serif',
        '::placeholder': { color: '#9ca3af' },
      },
    },
  };

  return (
    <article className="add-card-container">
      <header className="form-header">
        <h1>Secure Payment</h1>
        <p>Paying R {amount} to {groupName}</p>
      </header>

      <form onSubmit={handleSubmit} className="card-details-form">
        <label htmlFor="cardName">Cardholder's Name</label>
        <input 
          id="cardName"
          type="text" 
          placeholder="Enter full name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />

        <label htmlFor="cardNumber">Card Number</label>
        <section className="stripe-input-wrapper">
          <CardNumberElement id="cardNumber" options={elementOptions} />
        </section>

        <section className="split-inputs">
          <article>
            <label htmlFor="expiry">Expiry Date</label>
            <section className="stripe-input-wrapper">
              <CardExpiryElement id="expiry" options={elementOptions} />
            </section>
          </article>

          <article>
            <label htmlFor="cvc">CVC</label>
            <section className="stripe-input-wrapper">
              <CardCvcElement id="cvc" options={elementOptions} />
            </section>
          </article>
        </section>

        <label htmlFor="zip">ZIP / Postal Code</label>
        <input 
          id="zip"
          type="text"
          placeholder="12345"
          maxLength="5"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))} 
          required
        />
        
        <button type="submit" disabled={!stripe || processing} className="btn-pay-now">
          {processing ? "Processing..." : `Pay R${amount}`}
        </button>
      </form>
      
      <footer className="form-footer">
        <button onClick={onBack} className="btn-back-link">
          <ArrowLeft size={14} /> Back
        </button>
      </footer>
    </article>
  );
};

const PaymentGateway = (props) => {
  return (
    <main className="payment-view-bg">
      <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
      </Elements>
    </main>
  );
};

export default PaymentGateway;