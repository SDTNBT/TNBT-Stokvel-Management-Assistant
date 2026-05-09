import React, { useState } from 'react';
import './MemberDetails.css';

const MemberDetails = ({ member, onClose, onRemove }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  // Logic to handle different name formats
  const displayName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim();

  const handleConfirmYes = async () => {
    setError(null);
    const success = await onRemove(member._id);
    if (success) {
      setSuccessMsg("You have successfully removed this person as a member");
      setTimeout(() => onClose(), 2000);
    } else {
      setError("Failed to remove member.");
    }
  };

  if (successMsg) {
    return (
      <aside className="member-details-panel">
        <article className="status-container">
          <p className="success-message">{successMsg}</p>
        </article>
      </aside>
    );
  }

  return (
    <aside className="member-details-panel">
      <header className="details-header">
        <button type="button" className="close-details" onClick={onClose} aria-label="Close">×</button>
        <h2>{displayName}</h2>
      </header>

      <article className="details-content">
        {error && <p className="error-text">{error}</p>}
        {!showConfirm ? (
          <section className="profile-info">
            <section className="info-group">
              <label>Full Name</label>
              <p>{displayName}</p>
            </section>
            <section className="info-group">
              <label>Email Address</label>
              <p>{member.userEmail}</p>
            </section>
            <section className="info-group">
              <label>Role</label>
              <p>{member.memberType}</p>
            </section>
            <section className="info-group">
              <label>Date Joined Group</label>
              <p>{member.joiningDate ? new Date(member.joiningDate).toLocaleDateString('en-GB') : "N/A"}</p>
            </section>
            <footer className="details-footer">
              <button type="button" className="remove-trigger-btn" onClick={() => setShowConfirm(true)}>
                Remove Member
              </button>
            </footer>
          </section>
        ) : (
          <section className="confirmation-box">
            <p className="warning-text">Are you sure you want to remove this member?</p>
            <nav className="confirm-nav">
              <button type="button" className="confirm-btn no" onClick={() => setShowConfirm(false)}>No</button>
              <button type="button" className="confirm-btn yes" onClick={handleConfirmYes}>Yes</button>
            </nav>
          </section>
        )}
      </article>
    </aside>
  );
};

export default MemberDetails;