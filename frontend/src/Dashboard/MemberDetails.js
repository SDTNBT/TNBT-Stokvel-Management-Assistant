import React, { useState } from 'react';
import './MemberDetails.css';

const MemberDetails = ({ member, onClose, onRemove }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(false);

  const displayName =
    member.fullName ||
    `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
    'Unknown Member';

  const initial = displayName[0].toUpperCase();

  const getRoleColors = (type) => {
    if (type === 'Admin') return { bg: '#eef2ff', color: '#6366f1' };
    if (type === 'Treasurer') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#f0fdf4', color: '#16a34a' };
  };

  const roleColors = getRoleColors(member.memberType);

  const handleConfirmYes = async () => {
    setError(null);
    setRemoving(true);
    const success = await onRemove(member._id);
    setRemoving(false);
    if (success) {
      setSuccessMsg('Member has been successfully removed from the group.');
      setTimeout(() => onClose(), 2200);
    } else {
      setError('Failed to remove member. Please try again.');
      setShowConfirm(false);
    }
  };

  // ── Success state 
  if (successMsg) {
    return (
      <aside className="md-panel">
        <div className="md-success-screen">
          <div className="md-success-icon">✓</div>
          <p className="md-success-msg">{successMsg}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="md-panel">

      {/* ── HEADER ── */}
      <header className="md-header">
        <button
          type="button"
          className="md-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="md-header-info">
          <div
            className="md-header-avatar"
            style={{ background: roleColors.bg, color: roleColors.color }}
          >
            {initial}
          </div>
          <div>
            <h2 className="md-header-name">{displayName}</h2>
            <span
              className="md-header-role"
              style={{ background: roleColors.bg, color: roleColors.color }}
            >
              {member.memberType || 'Member'}
            </span>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="md-body">

        {error && (
          <div className="md-error" role="alert">{error}</div>
        )}

        {!showConfirm ? (
          <>
            {/* Info fields */}
            <div className="md-fields">
              <div className="md-field">
                <span className="md-field-label">Full Name</span>
                <span className="md-field-value">{displayName}</span>
              </div>
              <div className="md-field">
                <span className="md-field-label">Email Address</span>
                <span className="md-field-value">{member.userEmail || 'N/A'}</span>
              </div>
              <div className="md-field">
                <span className="md-field-label">Role</span>
                <span className="md-field-value">{member.memberType || 'Member'}</span>
              </div>
              <div className="md-field">
                <span className="md-field-label">Date Joined</span>
                <span className="md-field-value">
                  {member.joiningDate
                    ? new Date(member.joiningDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Remove button */}
            <button
              type="button"
              className="md-remove-btn"
              onClick={() => setShowConfirm(true)}
            >
              Remove Member
            </button>
          </>
        ) : (
          /* Confirm dialog */
          <div className="md-confirm-box">
            <div className="md-confirm-icon">⚠️</div>
            <p className="md-confirm-title">Remove Member?</p>
            <p className="md-confirm-sub">
              Are you sure you want to remove <strong>{displayName}</strong> from
              this group? This action cannot be undone.
            </p>
            <div className="md-confirm-btns">
              <button
                type="button"
                className="md-btn md-btn-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={removing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="md-btn md-btn-confirm"
                onClick={handleConfirmYes}
                disabled={removing}
              >
                {removing ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default MemberDetails;