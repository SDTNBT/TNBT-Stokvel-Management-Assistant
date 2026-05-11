import React from 'react';
import './ViewBankingDetails.css';

// SVG Icons as components
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const Building2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const ViewBankingDetails = ({ onEdit, onBack, bankData }) => {
  
  const maskAccountNumber = (number) => {
    if (!number) return '';
    return `•••• •••• ${number.slice(-4)}`;
  };

  if (!bankData) {
    return (
      <main className="view-banking-wrapper">
        <section className="view-banking-content" style={{ textAlign: 'center' }}>
          <h1 className="view-banking-title">No Details Found</h1>
          <button className="view-edit-button" onClick={onEdit} style={{ marginTop: '20px' }}>
            Add Details
          </button>
        </section>
      </main>
    );
  }

  const { bankName, accountNumber } = bankData;

  return (
    <main className="view-banking-wrapper">
      <section className="view-banking-content">
        <header className="view-banking-header">
           <button onClick={onBack} className="back-arrow-btn" style={{ background: 'none', border: 'none', marginBottom: '15px', cursor: 'pointer', color: '#64748b' }}>
            ← Back to Menu
          </button>
          <h1 className="view-banking-title">Your Banking Details</h1>
          <p className="view-banking-subtitle">Review your saved bank account for stokvel payouts</p>
        </header>

        <p className="view-verified-badge">
          <CheckCircleIcon /> Account Verified
        </p>

        <article className="view-bank-card">
          {/* Header section with Bank Name */}
          <header className="view-card-header">
            <figure className="view-bank-icon">
              <Building2Icon />
            </figure>
            <section className="view-bank-info">
              <small className="view-bank-label">Bank</small>
              <h3 className="view-bank-name">{bankName}</h3>
            </section>
          </header>

          {/* Body section with Account Number */}
          <section className="view-card-body">
            <article className="view-detail-row">
              <figure className="view-detail-icon">
                <CreditCardIcon />
              </figure>
              <section className="view-detail-info">
                <small className="view-detail-label">Account Number</small>
                <strong className="view-detail-value">
                  {maskAccountNumber(accountNumber)}
                </strong>
              </section>
            </article>
          </section>
        </article>

        <section className="view-security-notice">
          <LockIcon />
          <p>Your details are encrypted with 256-bit SSL</p>
        </section>

        <button className="view-edit-button" onClick={onEdit}>
          <PencilIcon /> Edit Banking Details
        </button>

        <footer className="view-trust-footer">
          <p className="view-trust-text">Trusted by 200+ stokvel groups across South Africa</p>
        </footer>
      </section>
    </main>
  );
};

export default ViewBankingDetails;