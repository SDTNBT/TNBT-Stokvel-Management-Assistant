import React, { useState, useEffect } from 'react';
import { schedulePayout, getScheduledPayouts, updatePayoutStatus } from '../services/payoutService';

const SchedulePayout = ({ groupName: propGroupName, members = [] }) => {

  // ── Form State ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    groupName: propGroupName || '',
    userId: '',
    userEmail: '',
    amount: '',
    payoutDate: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // ── Active Payouts State ────────────────────────────────────
  const [activePayouts, setActivePayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [payoutsError, setPayoutsError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // ── Fetch active payouts on mount ──────────────────────────
  useEffect(() => {
    fetchActivePayouts();
  }, []);

  const fetchActivePayouts = async () => {
    try {
      setPayoutsLoading(true);
      setPayoutsError('');
      const data = await getScheduledPayouts();
      setActivePayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPayoutsError('Failed to load active payouts.');
    } finally {
      setPayoutsLoading(false);
    }
  };

  // ── Form Handlers ──────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await schedulePayout(formData);
      setStatus({ type: 'success', message: response.message });
      setFormData({
        groupName: propGroupName || '',
        userId: '',
        userEmail: '',
        amount: '',
        payoutDate: ''
      });
      // Refresh the active payouts table
      fetchActivePayouts();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Status Update Handler ──────────────────────────────────
  const handleStatusUpdate = async (payoutId, newStatus) => {
    try {
      setUpdatingId(payoutId);
      await updatePayoutStatus(payoutId, newStatus);
      // Update local state immediately
      setActivePayouts(prev =>
        prev.map(p => p._id === payoutId ? { ...p, status: newStatus } : p)
      );
    } catch (err) {
      setPayoutsError(`Failed to update status to ${newStatus}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Scheduled:   { background: '#e3f2fd', color: '#1565c0' },
      Processing:  { background: '#fff8e1', color: '#f57c00' },
      Paid:        { background: '#e8f5e9', color: '#2e7d32' },
      Cancelled:   { background: '#ffebee', color: '#c62828' },
      Failed:      { background: '#ffebee', color: '#c62828' },
    };
    return styles[status] || { background: '#f5f5f5', color: '#555' };
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <section style={pageStyle}>

      {/* ── SCHEDULE FORM ── */}
      <article style={cardStyle}>
        <header style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1a3a6b' }}>Schedule a Payout</h2>
          <p style={{ color: '#666', marginTop: '6px', fontSize: '14px' }}>
            Enter the member details to schedule a payout to their linked bank account.
          </p>
        </header>

        {status.message && (
          <p
            role="alert"
            style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              backgroundColor: status.type === 'error' ? '#ffebee' : '#e8f5e9',
              color: status.type === 'error' ? '#c62828' : '#2e7d32',
              border: `1px solid ${status.type === 'error' ? '#ef9a9a' : '#a5d6a7'}`,
              fontSize: '14px'
            }}
          >
            {status.message}
          </p>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>

          <label style={labelStyle}>
            Group Name
            <input
              type="text"
              name="groupName"
              placeholder="e.g. Stokvel1"
              value={formData.groupName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Member Firebase ID
            <input
              type="text"
              name="userId"
              placeholder="Enter member Firebase UID"
              value={formData.userId}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Member Email
            <input
              type="email"
              name="userEmail"
              placeholder="member@example.com"
              value={formData.userEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Amount (ZAR)
            <input
              type="number"
              name="amount"
              placeholder="e.g. 500"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Payout Date
            <input
              type="date"
              name="payoutDate"
              value={formData.payoutDate}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            style={submitBtnStyle(isLoading)}
          >
            {isLoading ? 'Scheduling...' : 'Schedule Payout'}
          </button>

        </form>
      </article>

      {/* ── ACTIVE PAYOUTS TABLE ── */}
      <article style={cardStyle}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1a3a6b' }}>Active Payouts</h2>
            <p style={{ color: '#666', marginTop: '6px', fontSize: '14px' }}>
              Manage and update payout statuses. Members see these updates in their Virtual Account.
            </p>
          </div>
          <button onClick={fetchActivePayouts} style={refreshBtnStyle}>
            ↻ Refresh
          </button>
        </header>

        {payoutsError && (
          <p role="alert" style={{ color: '#c62828', fontSize: '14px', marginBottom: '12px' }}>
            {payoutsError}
          </p>
        )}

        {payoutsLoading ? (
          <p style={{ color: '#666', fontSize: '14px' }}>Loading payouts...</p>
        ) : activePayouts.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
            No active payouts. Scheduled payouts will appear here.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Group</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Bank</th>
                  <th style={thStyle}>Account</th>
                  <th style={thStyle}>Payout Date</th>
                  <th style={thStyle}>Reference</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePayouts.map(payout => (
                  <tr key={payout._id} style={{ background: '#fff' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '500' }}>{payout.accountHolder || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{payout.userEmail}</div>
                    </td>
                    <td style={tdStyle}>{payout.groupName || 'N/A'}</td>
                    <td style={tdStyle}>
                      <strong style={{ color: '#1a3a6b' }}>{formatCurrency(payout.amount)}</strong>
                    </td>
                    <td style={tdStyle}>{payout.bankName || 'N/A'}</td>
                    <td style={tdStyle}>
                      {payout.accountNumberLast4 ? `**** ${payout.accountNumberLast4}` : 'N/A'}
                    </td>
                    <td style={tdStyle}>{formatDate(payout.payoutDate)}</td>
                    <td style={tdStyle}>
                      <small style={{ color: '#888' }}>{payout.paymentReference || 'N/A'}</small>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        ...badgeStyle,
                        ...getStatusBadge(payout.status)
                      }}>
                        {payout.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {/* Show action buttons based on current status */}
                      {payout.status === 'Scheduled' && (
                        <div style={actionBtnsStyle}>
                          <button
                            style={actionBtn('#2e7d32', '#e8f5e9')}
                            disabled={updatingId === payout._id}
                            onClick={() => handleStatusUpdate(payout._id, 'Paid')}
                          >
                            ✓ Mark Paid
                          </button>
                          <button
                            style={actionBtn('#f57c00', '#fff8e1')}
                            disabled={updatingId === payout._id}
                            onClick={() => handleStatusUpdate(payout._id, 'Processing')}
                          >
                            ⟳ Processing
                          </button>
                          <button
                            style={actionBtn('#c62828', '#ffebee')}
                            disabled={updatingId === payout._id}
                            onClick={() => handleStatusUpdate(payout._id, 'Cancelled')}
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      )}
                      {payout.status === 'Processing' && (
                        <div style={actionBtnsStyle}>
                          <button
                            style={actionBtn('#2e7d32', '#e8f5e9')}
                            disabled={updatingId === payout._id}
                            onClick={() => handleStatusUpdate(payout._id, 'Paid')}
                          >
                            ✓ Mark Paid
                          </button>
                          <button
                            style={actionBtn('#c62828', '#ffebee')}
                            disabled={updatingId === payout._id}
                            onClick={() => handleStatusUpdate(payout._id, 'Failed')}
                          >
                            ✕ Failed
                          </button>
                        </div>
                      )}
                      {['Paid', 'Cancelled', 'Failed'].includes(payout.status) && (
                        <span style={{ color: '#999', fontSize: '12px' }}>— Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <footer style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            <strong>Note:</strong> When you mark a payout as <strong>Paid</strong>, 
            the member's Virtual Account balance updates automatically to reflect the received funds.
          </p>
        </footer>
      </article>

    </section>
  );
};

// ── STYLES ──────────────────────────────────────────────────

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  padding: '4px 0'
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '14px',
  padding: '24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxWidth: '480px'
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontWeight: '600',
  fontSize: '14px',
  color: '#333'
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '14px',
  fontWeight: 'normal',
  outline: 'none',
  transition: 'border 0.2s'
};

const submitBtnStyle = (isLoading) => ({
  padding: '12px',
  backgroundColor: isLoading ? '#9e9e9e' : '#1a3a6b',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  fontWeight: '600',
  fontSize: '15px',
  marginTop: '4px',
  transition: 'background 0.2s'
});

const refreshBtnStyle = {
  background: '#f0f4ff',
  border: '1px solid #c5d0f0',
  color: '#1a3a6b',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px'
};

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '2px solid #e0e0e0',
  background: '#f8fafc',
  color: '#444',
  fontWeight: '600',
  fontSize: '13px',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'middle'
};

const badgeStyle = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '600',
  whiteSpace: 'nowrap'
};

const actionBtnsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: '110px'
};

const actionBtn = (color, bg) => ({
  background: bg,
  color: color,
  border: `1px solid ${color}`,
  padding: '4px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap'
});

export default SchedulePayout;