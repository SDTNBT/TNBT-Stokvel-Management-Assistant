import React, { useState, useEffect } from 'react';
import './BankingDetails.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// SVG Icons as components
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const Building2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="banking-spinner" width="20" height="20" viewBox="0 0 24 24">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

const BankingDetails = ({ onBack }) => {
  
  const [banks, setBanks] = useState([]);
  const [fetchingBanks, setFetchingBanks] = useState(true);
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    idNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. ADD THIS STATE VARIABLE HERE
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/banking/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setBanks(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch bank list:", error);
      } finally {
        setFetchingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/banking/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({ show: true, message: result.message, type: 'success' });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
          onBack();
        }, 2000);
      } else {
        // API ERROR CASE (e.g., Paystack validation failed)
        setNotification({ show: true, message: result.message, type: 'error' });
        
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000); // Give them slightly longer to read the error
      }
    } catch (error) {
      // NETWORK/CRASH CASE
      setNotification({ show: true, message: "Connection failed", type: 'error' });
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="banking-page-wrapper">
      <div className="banking-form-content">
        <button className="banking-back-action" onClick={onBack} aria-label="Go back">
          <ArrowLeftIcon />
        </button>

        <div className="banking-badge">
          <SparklesIcon />
          Secure & Encrypted
          <SparklesIcon />
        </div>

        <header className="banking-header">
          <div className="banking-icon-wrapper">
            <Building2Icon />
          </div>
          <h2 className="banking-title">Banking Details</h2>
          <p className="banking-description">
            Add your bank account for seamless payouts
          </p>
        </header>

        <div className="banking-security-notice">
          <div className="banking-security-icon">
            <ShieldIcon />
          </div>
          <p className="banking-security-text">
            Your details are encrypted and used only for your scheduled stokvel payouts.
          </p>
        </div>

        <form className="banking-form" onSubmit={handleSubmit}>
          {/* ... all your form fields stay the same ... */}
          <div className="banking-field">
            <label className="banking-label" htmlFor="bankName">
              <Building2Icon /> Bank Name
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="bankName"
                name="bankName"
                className="banking-select"
                value={formData.bankName}
                onChange={handleInputChange}
                required
                disabled={fetchingBanks}
              >
                {fetchingBanks ? (
                  <option value="">Loading South African Banks...</option>
                ) : (
                  <>
                    <option value="" disabled>Select your bank</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.name}>{bank.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="banking-field">
            <label className="banking-label" htmlFor="accountHolder">
              <UserIcon /> Account Holder Name
            </label>
            <input
              type="text"
              id="accountHolder"
              name="accountHolder"
              className="banking-input"
              value={formData.accountHolder}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="banking-field">
            <label className="banking-label" htmlFor="accountNumber">
              <CreditCardIcon /> Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              className="banking-input"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              pattern="\d*"
            />
          </div>

          <div className="banking-field">
            <label className="banking-label" htmlFor="idNumber">
              <ShieldIcon /> RSA ID Number
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              className="banking-input"
              value={formData.idNumber}
              onChange={handleInputChange}
              required
              maxLength="13"
              pattern="\d*"
            />
          </div>

          <button type="submit" className="banking-submit" disabled={isSubmitting || fetchingBanks}>
            {isSubmitting ? (
              <> <SpinnerIcon /> Saving... </>
            ) : (
              <> <SaveIcon /> Save Banking Details </>
            )}
          </button>
        </form>

        <footer className="banking-trust-badges">
          <div className="banking-trust-item">
            <ShieldIcon /> Bank-level security
          </div>
        </footer>
      </div>

      {/* 2. THE POPUP MUST BE INSIDE THE RETURN WRAPPER */}
      {notification.show && (
        <div className={`banking-toast ${notification.type}`}>
          <div className="toast-content">
            {notification.type === 'success' ? <SparklesIcon /> : <ShieldIcon />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingDetails;