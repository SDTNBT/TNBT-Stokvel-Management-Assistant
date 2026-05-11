import React, { useState, useEffect } from 'react';
import './MemberContributionHistory.css';

const MemberContributionHistory = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groups, setGroups] = useState([]);

  const sessionUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const userEmail = user?.email || sessionUser.email;

  useEffect(() => {
    if (userEmail) {
      fetchPaymentHistory();
      fetchPaymentSummary();
    }
  }, [userEmail]);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments/${userEmail}`);
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        
        const uniqueGroups = [...new Set(data.payments.map(p => p.groupName))];
        setGroups(uniqueGroups);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments-summary/${userEmail}`);
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || 'confirmed';
    switch(statusLower) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-confirmed';
    }
  };

  const downloadCSV = () => {
    const filtered = getFilteredPayments();
    
    const headers = ['Date', 'Group Name', 'Amount', 'Transaction ID', 'Status'];
    const rows = filtered.map(p => [
      formatDate(p.date),
      p.groupName,
      p.amount,
      p.transactionId,
      p.status || 'Confirmed'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions_${userEmail}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredPayments = () => {
    let filtered = [...payments];
    
    if (filterGroup) {
      filtered = filtered.filter(p => p.groupName === filterGroup);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(p => (p.status || 'Confirmed').toLowerCase() === filterStatus.toLowerCase());
    }
    
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
    }
    
    return filtered;
  };

  const filteredPayments = getFilteredPayments();
  const totalFilteredAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <section className="contribution-history-container">
        <p className="loading-spinner">Loading your contribution history...</p>
      </section>
    );
  }

  return (
    <section className="contribution-history-container">
      <header className="contribution-header">
        <h2>My Contribution History</h2>
        <p>Track all your payments across all stokvel groups</p>
      </header>

      {summary && (
        <section className="summary-cards">
          <article className="summary-card">
            <h3>Total Paid</h3>
            <p className="summary-value">{formatCurrency(summary.totalPaid)}</p>
          </article>
          <article className="summary-card">
            <h3>Total Payments</h3>
            <p className="summary-value">{summary.totalPayments}</p>
          </article>
          <article className="summary-card">
            <h3>Groups Participating</h3>
            <p className="summary-value">{summary.uniqueGroups}</p>
          </article>
          <article className="summary-card">
            <h3>Last Payment</h3>
            <p className="summary-value">{summary.lastPaymentDate ? formatDate(summary.lastPaymentDate) : 'N/A'}</p>
            <p className="summary-label">{summary.lastPaymentAmount ? formatCurrency(summary.lastPaymentAmount) : ''}</p>
          </article>
        </section>
      )}

      <section className="filters-section">
        <article className="filter-group">
          <label htmlFor="groupFilter">Filter by Group</label>
          <select id="groupFilter" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </article>

        <article className="filter-group">
          <label htmlFor="statusFilter">Filter by Status</label>
          <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </article>

        <article className="filter-group">
          <label htmlFor="startDate">From Date</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </article>

        <article className="filter-group">
          <label htmlFor="endDate">To Date</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </article>

        <article className="filter-group">
          <label>&nbsp;</label>
          <button className="download-btn" onClick={downloadCSV}>
            Download CSV
          </button>
        </article>
      </section>

      {filteredPayments.length === 0 ? (
        <p className="no-data">No contributions found. Make your first payment to see it here.</p>
      ) : (
        <>
          <section className="table-wrapper">
            <table className="contribution-table">
              <caption>List of your contributions across all stokvel groups</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Group Name</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Transaction ID</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td><time dateTime={payment.date}>{formatDate(payment.date)}</time></td>
                    <td>
                      <span className="group-tag">{payment.groupName}</span>
                    </td>
                    <td><strong>{formatCurrency(payment.amount)}</strong></td>
                    <td>
                      <small>{payment.transactionId?.slice(-8) || 'N/A'}</small>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(payment.status)}`}>
                        {payment.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2" style={{ textAlign: 'right' }}>Total:</td>
                  <td colSpan="1">{formatCurrency(totalFilteredAmount)}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </section>
        </>
      )}
    </section>
  );
};

export default MemberContributionHistory;
