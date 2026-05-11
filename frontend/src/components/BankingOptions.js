// BankingOptions.js - StokvelStokkie Banking Options Component
import React from 'react';
import './BankingOptions.css';

// SVG Icons remain the same...
const Building2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// BankingOptions.js

const BankingOptions = ({ 
  hasBankingDetails, 
  onViewDetails, 
  onAddEditDetails, 
  onBack 
}) => {
  return (
    <main className="banking-options-page">
      <article className="banking-options-content-wrapper">
        {/* Header stays the same */}
        <header className="banking-options-header">
          <figure className="banking-options-icon-wrapper">
            <Building2Icon />
          </figure>
          <h2 className="banking-options-title">Banking Details</h2>
          <p className="banking-options-description">
            Manage your bank account for stokvel payouts
          </p>
        </header>

        <nav className="banking-options-list">
          <button
            className="banking-option-btn banking-option-btn--view"
            onClick={onViewDetails}
          >
            <figure className="banking-option-icon">
              <EyeIcon />
            </figure>
            <section className="banking-option-text">
              <strong className="banking-option-title">View Banking Details</strong>
              <small className="banking-option-subtitle">
                {hasBankingDetails ? 'Review your saved bank account' : 'No details saved yet'}
              </small>
            </section>
            <ChevronRightIcon className="banking-option-arrow" />
          </button>

          <button
            className="banking-option-btn banking-option-btn--edit"
            onClick={onAddEditDetails}
          >
            <figure className="banking-option-icon">
              {hasBankingDetails ? <PencilIcon /> : <PlusIcon />}
            </figure>
            <section className="banking-option-text">
              <strong className="banking-option-title">
                {hasBankingDetails ? 'Edit Banking Details' : 'Add Banking Details'}
              </strong>
              <small className="banking-option-subtitle">
                {hasBankingDetails ? 'Update your bank account' : 'Add your bank account'}
              </small>
            </section>
            <ChevronRightIcon className="banking-option-arrow" />
          </button>
        </nav>

        {/* REMOVED: The notice aside block is gone from here */}

        <footer className="banking-options-trust">
          {/* Trust badges stay the same... */}
        </footer>

        <button className="banking-options-back" onClick={onBack}>
          <ChevronLeftIcon />
          Back to Home
        </button>
      </article>
    </main>
  );
};
export default BankingOptions;