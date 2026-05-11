import React from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import './PaymentPreview.css';

const PaymentPreview = ({ groupName, amount, onConfirm, onCancel }) => {
  return (
    <section className="payment-preview-centered">
      <article className="summary-card">
        <header className="card-header">
          <figure className="lock-avatar">
            <Lock size={24} />
          </figure>
          <h2>Payment Summary</h2>
        </header>

        <dl className="info-list">
          <dt>STOKVEL GROUP</dt>
          <dd>{groupName || "General Fund"}</dd>
          
          <dt>CONTRIBUTION AMOUNT</dt>
          <dd className="amount-value">R {amount || "0.00"}</dd>
          
          <dt>BILLING DATE</dt>
          <dd>{new Date().toLocaleDateString('en-ZA')}</dd>
        </dl>

        <footer className="card-footer">
          <button type="button" className="btn-pay" onClick={onConfirm}>
            <Lock size={18} />
            <p>Proceed to Pay</p>
            <ChevronRight size={18} />
          </button>
          
          <button type="button" className="btn-cancel-flat" onClick={onCancel}>
            Cancel
          </button>
        </footer>
      </article>
    </section>
  );
};

export default PaymentPreview;