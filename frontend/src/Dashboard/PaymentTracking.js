import React, { useState, useEffect, useMemo } from 'react';
import './PaymentTracking.css';


const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);
const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BarChart3Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);
const FlagIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
  </svg>
);
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const MoreVertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);


const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName[0] : '';
  const l = lastName ? lastName[0] : '';
  return (f + l).toUpperCase() || '?';
};

const formatCurrency = (amount) => {
  return `R ${Number(amount || 0).toLocaleString('en-ZA')}`;
};


const PaymentTracking = ({ groupId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  
  useEffect(() => {
    if (!groupId) {
      setError("No group ID provided.");
      setLoading(false);
      return;
    }

    const fetchGroupMembers = async () => {
      try {
        setLoading(true);
        
        
        const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : (process.env.REACT_APP_API_URL || 'https://tnbt-stokvel-management-assistant.onrender.com/api');
        const response = await fetch(`${baseUrl}/groups/${groupId}/contributions`);
        
        if (!response.ok) throw new Error('Failed to load group database ledger');
        
        const data = await response.json();
        
        
        const formattedData = data.map((record) => ({
          id: record._id || record.id,
          firstName: record.name || '',
          lastName: record.surname || '',
          email: record.email || '',
          amount: record.amount || 0,
          status: 'pending',
          dueDate: '2026-06-01' 
        }));

        setPayments(formattedData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

  
  const showToast = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2500);
  };

  
  const handleToggleFlag = (id) => {
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'flagged' ? 'pending' : 'flagged';
        const fullName = `${p.firstName} ${p.lastName}`;
        showToast(
          newStatus === 'flagged' ? `${fullName} flagged` : `${fullName} unflagged`,
          newStatus === 'flagged' ? 'info' : 'success'
        );
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleStatusChange = (id, newStatus) => {
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        showToast(`${p.firstName} ${p.lastName} set to ${newStatus}`, 'success');
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleReminder = (payment) => {
    showToast(`Reminder alert generated for ${payment.firstName}`, 'success');
  };

  const handleEmailAllOutstanding = () => {
    const outstanding = payments.filter(p => p.status === 'missed' || p.status === 'flagged');
    showToast(`Dispatched reminders to ${outstanding.length} outstanding accounts`, 'success');
  };

  
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                            p.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = statusFilter === 'all' ||
                            (statusFilter === 'outstanding' ? (p.status === 'missed' || p.status === 'flagged') : p.status === statusFilter);
      return matchesSearch && matchesFilter;
    });
  }, [payments, searchQuery, statusFilter]);

  
  const metrics = useMemo(() => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid');
    const outstanding = payments.filter(p => p.status === 'missed' || p.status === 'flagged');
    const totalCollected = paid.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = outstanding.reduce((sum, p) => sum + p.amount, 0);
    const completionRate = total > 0 ? Math.round((paid.length / total) * 100) : 0;
    return { total, paid: paid.length, outstanding: outstanding.length, totalCollected, totalOutstanding, completionRate };
  }, [payments]);

  const flaggedPayments = useMemo(() => {
    return payments.filter(p => p.status === 'flagged' || p.status === 'missed');
  }, [payments]);

  if (loading) return <article className="table-empty"><p>Loading tracking ledger data...</p></article>;
  if (error) return <article className="table-empty" style={{ color: 'var(--stokvel-red)' }}><p>Error: {error}</p></article>;

  return (
    <section className="treasurer-page" style={{ padding: '0' }}>
      <section className="treasurer-container">

        {/* Dynamic App Header */}
        <header className="treasurer-header">
          <nav className="treasurer-header-left">
            <header className="treasurer-icon-box"><LayoutDashboardIcon /></header>
            <hgroup>
              <h1 className="treasurer-title">Payment Tracking</h1>
              <p className="treasurer-subtitle">Group Reference Code: {groupId}</p>
            </hgroup>
          </nav>
          <nav className="treasurer-header-actions">
            <button className="btn-secondary" title="Export CSV"><DownloadIcon /> Export</button>
            <button className="btn-primary" onClick={handleEmailAllOutstanding}><MailIcon /> Email Outstanding</button>
          </nav>
        </header>

        {/* Real-time Indicator Cards */}
        <section className="metrics-grid">
          <article className="metric-card">
            <header className="metric-card-header">
              <strong className="metric-card-label">Total Collected</strong>
              <figure className="metric-icon green"><DollarSignIcon /></figure>
            </header>
            <p className="metric-value">{formatCurrency(metrics.totalCollected)}</p>
            <footer className="metric-change positive"><TrendingUpIcon /> Updated tracking</footer>
          </article>

          <article className="metric-card">
            <header className="metric-card-header">
              <strong className="metric-card-label">Outstanding Balance</strong>
              <figure className="metric-icon red"><AlertTriangleIcon /></figure>
            </header>
            <p className="metric-value">{formatCurrency(metrics.totalOutstanding)}</p>
            <footer className="metric-change negative"><TrendingDownIcon /> {metrics.outstanding} flags recorded</footer>
          </article>

          <article className="metric-card">
            <header className="metric-card-header">
              <strong className="metric-card-label">Completion Progress</strong>
              <figure className="metric-icon green"><BarChart3Icon /></figure>
            </header>
            <p className="metric-value">{metrics.completionRate}%</p>
            <section className="metric-progress-wrapper">
              <section className="metric-progress-track">
                <section className="metric-progress-fill" style={{ width: `${metrics.completionRate}%` }}></section>
              </section>
              <footer className="metric-progress-label">
                <p>{metrics.paid} paid</p>
                <p>{metrics.total} total</p>
              </footer>
            </section>
          </article>

          <article className="metric-card">
            <header className="metric-card-header">
              <strong className="metric-card-label">Active Database Cohort</strong>
              <figure className="metric-icon navy"><UsersIcon /></figure>
            </header>
            <p className="metric-value">{metrics.total}</p>
            <footer className="metric-change positive"><TrendingUpIcon /> Registry members</footer>
          </article>
        </section>

        {/* Interactive Workspace Area */}
        <section className="treasurer-body">
          <section>
            <nav className="filters-bar">
              <input
                className="filter-search"
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="missed">Missed</option>
                <option value="flagged">Flagged</option>
                <option value="outstanding">Outstanding</option>
              </select>
            </nav>

            <article className="table-card">
              <header className="table-card-header">
                <h2 className="table-card-title">Member Accounts</h2>
                <em className="table-count-badge">{filteredPayments.length} shown</em>
              </header>

              <section className="table-scroll">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Member Profile</th>
                      <th>Target Date</th>
                      <th>Expected Amount</th>
                      <th>Payment Status</th>
                      <th>Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="5">
                          <article className="table-empty">
                            <SearchIcon />
                            <p>No matching database records found.</p>
                          </article>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map(payment => (
                        <tr key={payment.id}>
                          <td>
                            <nav className="member-cell">
                              <figure className="member-avatar">{getInitials(payment.firstName, payment.lastName)}</figure>
                              <hgroup>
                                <p className="member-name">{payment.firstName} {payment.lastName}</p>
                                <small className="member-email">{payment.email}</small>
                              </hgroup>
                            </nav>
                          </td>
                          <td>{new Date(payment.dueDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td><strong className="amount-value">{formatCurrency(payment.amount)}</strong></td>
                          <td>
                            <select
                              className="status-select"
                              value={payment.status}
                              onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                            >
                              <option value="paid">Paid</option>
                              <option value="pending">Pending</option>
                              <option value="missed">Missed</option>
                              <option value="flagged">Flagged</option>
                            </select>
                          </td>
                          <td>
                            <nav className="row-actions">
                              <button
                                className={`action-btn flag-btn ${payment.status === 'flagged' ? 'active' : ''}`}
                                title="Toggle verification flag"
                                onClick={() => handleToggleFlag(payment.id)}
                              >
                                <FlagIcon />
                              </button>
                              {(payment.status === 'missed' || payment.status === 'flagged') && (
                                <button
                                  className="action-btn remind-btn"
                                  title="Send notification ping"
                                  onClick={() => handleReminder(payment)}
                                >
                                  <BellIcon />
                                </button>
                              )}
                              <button className="action-btn" title="More options"><MoreVertIcon /></button>
                            </nav>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </section>
            </article>
          </section>

          {/* Right Summary Sidebar Panel */}
          <aside className="flagged-panel">
            <header className="flagged-panel-header">
              <h3 className="flagged-panel-title">
                <FlagIcon size={18} /> Outstanding List
                <em className="flagged-count">{flaggedPayments.length}</em>
              </h3>
            </header>

            <section className="flagged-list">
              {flaggedPayments.length === 0 ? (
                <article className="flagged-empty">
                  <CheckCircleIcon /> All accounts manual tracking clear.
                </article>
              ) : (
                flaggedPayments.map(p => (
                  <article className="flagged-item" key={p.id}>
                    <figure className="flagged-avatar">{getInitials(p.firstName, p.lastName)}</figure>
                    <section className="flagged-info">
                      <p className="flagged-name">{p.firstName} {p.lastName}</p>
                      <footer className="flagged-detail">
                        <em className={`status-badge ${p.status}`}>
                          <em className="dot"></em> {p.status}
                        </em>
                      </footer>
                    </section>
                    <strong className="flagged-amount">{formatCurrency(p.amount)}</strong>
                  </article>
                ))
              )}
            </section>

            {flaggedPayments.length > 0 && (
              <footer className="flagged-panel-footer">
                <button className="btn-outline-amber" onClick={handleEmailAllOutstanding}>
                  <MailIcon /> Email All Outstanding
                </button>
              </footer>
            )}
          </aside>
        </section>
      </section>

      {/* Global Toast Monitor Popups */}
      {notification.show && (
        <aside className={`treasurer-toast ${notification.type}`}>
          <section className="toast-inner">
            {notification.type === 'success' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
            <p>{notification.message}</p>
          </section>
        </aside>
      )}
    </section>
  );
};

export default PaymentTracking;