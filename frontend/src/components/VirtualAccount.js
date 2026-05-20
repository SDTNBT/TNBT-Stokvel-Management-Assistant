import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getMemberPayouts } from '../services/payoutService';
import './VirtualAccount.css';

const VirtualAccount = ({ user, onLogout = () => {} }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showPayoutNotifications, setShowPayoutNotifications] = useState(false);

  // Track which notification IDs have been read (stored locally)
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('va_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const location = useLocation();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const sessionUser =
    user || location.state?.user || JSON.parse(sessionStorage.getItem('user') || '{}');
  const userEmail = sessionUser?.email;
  const groupName = location.state?.groupName || 'Stokvel Group';

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        setError('');
        if (!userEmail) throw new Error('User email not found. Please log in again.');
        const data = await getMemberPayouts(userEmail);
        setPayouts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load account data');
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, [userEmail]);

  // =====================================================
  // MARK AS READ
  // =====================================================

  const markAsRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('va_read_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = pendingPayouts.map(p => p._id);
    const updated = [...new Set([...readIds, ...allIds])];
    setReadIds(updated);
    localStorage.setItem('va_read_notifications', JSON.stringify(updated));
  };

  const isRead = (id) => readIds.includes(id);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const paidPayouts = payouts.filter(p => p.status?.toLowerCase() === 'paid');
  const pendingPayouts = payouts.filter(p =>
    ['scheduled', 'processing'].includes(p.status?.toLowerCase())
  );
  const failedPayouts = payouts.filter(p =>
    ['cancelled', 'failed'].includes(p.status?.toLowerCase())
  );

  const totalReceived = paidPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const latestWithBank = payouts.find(p => p.bankName);
  const bankName = latestWithBank?.bankName || 'No bank linked';
  const accountLast4 = latestWithBank?.accountNumberLast4 || '----';
  const accountHolder =
    latestWithBank?.accountHolder ||
    sessionUser?.name ||
    sessionUser?.firstName ||
    'Member';

  const lastPaid = [...paidPayouts].sort(
    (a, b) => new Date(b.payoutDate) - new Date(a.payoutDate)
  )[0];

  // Unread = pending payouts not yet marked as read
  const unreadCount = pendingPayouts.filter(p => !isRead(p._id)).length;

  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'paid') return { background: '#e8f5e9', color: '#2e7d32' };
    if (s === 'cancelled' || s === 'failed') return { background: '#ffebee', color: '#c62828' };
    if (s === 'processing') return { background: '#fff8e1', color: '#f57c00' };
    return { background: '#e3f2fd', color: '#1565c0' };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="va-shell">
        <div className="va-loading">
          <div className="va-spinner" />
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="va-shell">

      {/* ── HEADER ── */}
      <header className="va-header">
        <button className="va-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="va-header-title">
          <h1>My Virtual Account</h1>
          <p>Simulated stokvel payout account</p>
        </div>

        {/* Payout Notification Bell */}
        <div className="va-notification-wrapper">
          <button
            className="va-notif-btn"
            onClick={() => setShowPayoutNotifications(!showPayoutNotifications)}
            aria-label="Payout Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            <span>Payout Notifications</span>
            {unreadCount > 0 && (
              <span className="va-notif-count">{unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showPayoutNotifications && (
            <div className="va-notif-dropdown">

              {/* Dropdown Header */}
              <div className="va-notif-header">
                <h4 className="va-notif-title">Pending Payouts</h4>
                {pendingPayouts.length > 0 && unreadCount > 0 && (
                  <button className="va-mark-all-btn" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              {pendingPayouts.length === 0 ? (
                <p className="va-notif-empty">No pending payouts</p>
              ) : (
                pendingPayouts.map(p => (
                  <div
                    key={p._id}
                    className={`va-notif-item ${isRead(p._id) ? 'va-notif-read' : 'va-notif-unread'}`}
                    onClick={() => markAsRead(p._id)}
                  >
                    {/* Unread dot */}
                    {!isRead(p._id) && <span className="va-unread-dot" />}

                    <div className="va-notif-item-header">
                      <span className="va-notif-group">{p.groupName}</span>
                      <span className="va-notif-status">{p.status}</span>
                    </div>
                    <p className="va-notif-amount">{formatCurrency(p.amount)}</p>
                    <p className="va-notif-date">
                      Expected: {formatDate(p.payoutDate)}
                    </p>
                    <p className="va-notif-ref">
                      Ref: {p.paymentReference || 'N/A'}
                    </p>

                    {!isRead(p._id) && (
                      <button
                        className="va-mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(p._id);
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      <main className="va-main">

        {error && (
          <div className="va-error" role="alert">{error}</div>
        )}

        {/* ── ACCOUNT CARD ── */}
        <section className="va-account-card">
          <div className="va-card-top">
            <div>
              <p className="va-card-label">Account Holder</p>
              <p className="va-card-value">{accountHolder}</p>
            </div>
            <div className="va-card-badge">Simulated</div>
          </div>

          <div className="va-card-number">
            **** **** **** {accountLast4}
          </div>

          <div className="va-card-bottom">
            <div>
              <p className="va-card-label">Bank</p>
              <p className="va-card-value">{bankName}</p>
            </div>
            <div>
              <p className="va-card-label">Last Payment</p>
              <p className="va-card-value">
                {lastPaid ? formatDate(lastPaid.payoutDate) : 'None yet'}
              </p>
            </div>
            <div>
              <p className="va-card-label">Group</p>
              <p className="va-card-value">{groupName}</p>
            </div>
          </div>
        </section>

        {/* ── BALANCE TILES ── */}
        <section className="va-balance-grid">
          <article className="va-balance-tile va-tile-green">
            <p className="va-tile-label">Total Received</p>
            <p className="va-tile-amount">{formatCurrency(totalReceived)}</p>
            <p className="va-tile-sub">{paidPayouts.length} paid payout(s)</p>
          </article>

          <article className="va-balance-tile va-tile-blue">
            <p className="va-tile-label">Pending</p>
            <p className="va-tile-amount">{formatCurrency(totalPending)}</p>
            <p className="va-tile-sub">{pendingPayouts.length} awaiting payment</p>
          </article>

          <article className="va-balance-tile va-tile-purple">
            <p className="va-tile-label">Total Transactions</p>
            <p className="va-tile-amount">{payouts.length}</p>
            <p className="va-tile-sub">All time</p>
          </article>
        </section>

        {/* ── TABS ── */}
        <div className="va-tabs">
          {['overview', 'received', 'pending', 'all'].map(tab => (
            <button
              key={tab}
              className={`va-tab-btn ${activeTab === tab ? 'va-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'received' && `Received (${paidPayouts.length})`}
              {tab === 'pending' && `Pending (${pendingPayouts.length})`}
              {tab === 'all' && `All Transactions (${payouts.length})`}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <section className="va-overview">
            <div className="va-overview-grid">
              <article className="va-overview-card">
                <h3>Account Summary</h3>
                <div className="va-summary-row">
                  <span>Total Received</span>
                  <strong style={{ color: '#2e7d32' }}>{formatCurrency(totalReceived)}</strong>
                </div>
                <div className="va-summary-row">
                  <span>Pending Payouts</span>
                  <strong style={{ color: '#1565c0' }}>{formatCurrency(totalPending)}</strong>
                </div>
                <div className="va-summary-row">
                  <span>Failed / Cancelled</span>
                  <strong style={{ color: '#c62828' }}>{failedPayouts.length} payout(s)</strong>
                </div>
                <div className="va-summary-row va-summary-total">
                  <span>Net Balance</span>
                  <strong>{formatCurrency(totalReceived)}</strong>
                </div>
              </article>

              <article className="va-overview-card">
                <h3>Linked Bank Account</h3>
                <div className="va-summary-row">
                  <span>Bank Name</span>
                  <strong>{bankName}</strong>
                </div>
                <div className="va-summary-row">
                  <span>Account Number</span>
                  <strong>**** **** {accountLast4}</strong>
                </div>
                <div className="va-summary-row">
                  <span>Account Holder</span>
                  <strong>{accountHolder}</strong>
                </div>
                <div className="va-summary-row">
                  <span>Last Payment Date</span>
                  <strong>{lastPaid ? formatDate(lastPaid.payoutDate) : 'None yet'}</strong>
                </div>
              </article>
            </div>

            <p className="va-sim-notice">
              ℹ️ This is a simulated account. In production, payouts would be processed
              via EFT directly to your linked bank account within 1–2 business days.
            </p>
          </section>
        )}

        {/* ── RECEIVED TAB ── */}
        {activeTab === 'received' && (
          <section className="va-table-section">
            <h3>Received Payments</h3>
            {paidPayouts.length === 0 ? (
              <p className="va-empty">No payments received yet.</p>
            ) : (
              <PayoutTable
                payouts={paidPayouts}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusStyle={getStatusStyle}
              />
            )}
          </section>
        )}

        {/* ── PENDING TAB ── */}
        {activeTab === 'pending' && (
          <section className="va-table-section">
            <h3>Pending Payouts</h3>
            {pendingPayouts.length === 0 ? (
              <p className="va-empty">No pending payouts.</p>
            ) : (
              <PayoutTable
                payouts={pendingPayouts}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusStyle={getStatusStyle}
              />
            )}
          </section>
        )}

        {/* ── ALL TRANSACTIONS TAB ── */}
        {activeTab === 'all' && (
          <section className="va-table-section">
            <h3>All Transactions</h3>
            {payouts.length === 0 ? (
              <p className="va-empty">No transactions found.</p>
            ) : (
              <PayoutTable
                payouts={payouts}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusStyle={getStatusStyle}
              />
            )}
          </section>
        )}

      </main>
    </div>
  );
};

// ── REUSABLE TABLE ──
const PayoutTable = ({ payouts, formatCurrency, formatDate, getStatusStyle }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="va-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Group</th>
          <th>Amount</th>
          <th>Bank</th>
          <th>Account</th>
          <th>Reference</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {payouts.map(payout => (
          <tr key={payout._id}>
            <td>{formatDate(payout.payoutDate)}</td>
            <td>{payout.groupName || 'N/A'}</td>
            <td><strong>{formatCurrency(payout.amount)}</strong></td>
            <td>{payout.bankName || 'N/A'}</td>
            <td>{payout.accountNumberLast4 ? `**** ${payout.accountNumberLast4}` : 'N/A'}</td>
            <td><small>{payout.paymentReference || 'N/A'}</small></td>
            <td>
              <span className="va-status-badge" style={getStatusStyle(payout.status)}>
                {payout.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default VirtualAccount;
