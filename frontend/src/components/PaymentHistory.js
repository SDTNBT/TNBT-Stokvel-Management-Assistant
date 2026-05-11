import React, { useState, useEffect } from 'react';
import './PaymentHistory.css';

const PaymentHistory = ({ user, groupName, groupId }) => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groups, setGroups] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const userEmail = user?.email || sessionUser.email;
  const userName = user?.name || sessionUser.name;

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

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://tnbt-stokvel-management-assistant.onrender.com/api/payments/record-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          groupName: groupName,
          payerName: userName,
          userEmail: userEmail,
          userId: sessionUser._id || sessionUser.id,
          paymentMethod: paymentMethod,
          status: 'Pending',
          date: new Date()
        })
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setPaymentAmount('');
        fetchPaymentHistory();
        fetchPaymentSummary();
        alert('Payment recorded successfully. It will be confirmed by the treasurer.');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    const statusLower = status?.toLowerCase() || 'pending';
    switch(statusLower) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const downloadCSV = () => {
    const filtered = getFilteredPayments();
    
    const headers = ['Date', 'Group Name', 'Amount', 'Transaction ID', 'Status'];
    const rows = filtered.map(p => [
      formatDate(p.date),
      p.groupName,
      p.amount,
      p.transactionId || 'N/A',
      p.status || 'Pending'
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
      filtered = filtered.filter(p => (p.status || 'Pending').toLowerCase() === filterStatus.toLowerCase());
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
      <section className="payment-history-container">
        <p className="loading-spinner">Loading payment history...</p>
      </section>
    );
  }

  return (
    <section className="payment-history-container">
      <header className="payment-header">
        <h2>Payment History</h2>
        <p>Track all your payments and make new contributions</p>
      </header>

      <button type="button" className="make-payment-btn" onClick={() => setShowPaymentModal(true)}>
        + Make a Payment
      </button>

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
          <button type="button" className="download-btn" onClick={downloadCSV}>
            Download CSV
          </button>
        </article>
      </section>

      {filteredPayments.length === 0 ? (
        <p className="no-data">No payments found. Make your first payment to see it here.</p>
      ) : (
        <section className="table-wrapper">
          <table className="payment-table">
            <caption>List of your payments across all stokvel groups</caption>
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
                    <small>{payment.transactionId?.slice(-8) || 'Manual'}</small>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(payment.status)}`}>
                      {payment.status || 'Pending'}
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
      )}

      {showPaymentModal && (
        <aside className="modal-overlay" role="dialog" aria-modal="true">
          <article className="modal-content">
            <header className="modal-header">
              <h3>Make a Payment</h3>
              <button type="button" className="modal-close" onClick={() => setShowPaymentModal(false)} aria-label="Close">
                ✕
              </button>
            </header>
            <form onSubmit={handleMakePayment}>
              <fieldset>
                <legend className="visually-hidden">Payment details</legend>
                
                <label htmlFor="paymentAmount">Amount (R)</label>
                <input
                  type="number"
                  id="paymentAmount"
                  required
                  min="10"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="eft">EFT</option>
                </select>
                
                <label htmlFor="groupName">Group</label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  disabled
                  className="disabled-input"
                />
              </fieldset>
              
              <footer className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Submit Payment'}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}
    </section>
  );
};

export default PaymentHistory;
