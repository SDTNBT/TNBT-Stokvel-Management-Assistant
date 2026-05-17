import React, { useState, useEffect } from 'react';
import './ContributionCompliance.css';

const ContributionCompliance = ({ user, groupName, groupId, monthlyContribution = 0 }) => {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const userEmail = user?.email || sessionUser.email;

  useEffect(() => {
    if (userEmail && groupName) {
      fetchComplianceData();
    }
  }, [userEmail, groupName]);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/payments/compliance/${userEmail}?groupName=${encodeURIComponent(groupName)}`);
      
      if (response.ok) {
        const data = await response.json();
        setComplianceData(data);
      } else {
        setError('Failed to load compliance data');
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (rate) => {
    if (rate >= 90) return 'excellent';
    if (rate >= 75) return 'good';
    if (rate >= 50) return 'average';
    return 'poor';
  };

  const getComplianceMessage = (rate) => {
    if (rate >= 90) return 'Excellent! You are very consistent.';
    if (rate >= 75) return 'Good. Keep up the momentum.';
    if (rate >= 50) return 'Average. Try to improve consistency.';
    return 'Needs attention. Consider setting up reminders.';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
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

  if (loading) {
    return (
      <section className="compliance-container">
        <p className="loading-text">Loading compliance report...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="compliance-container">
        <p className="error-text">{error}</p>
      </section>
    );
  }

  if (!complianceData) {
    return (
      <section className="compliance-container">
        <p className="no-data-text">No compliance data available. Make your first payment to see reports.</p>
      </section>
    );
  }

  const complianceColor = getComplianceColor(complianceData.complianceRate);
  const complianceMessage = getComplianceMessage(complianceData.complianceRate);

  return (
    <section className="compliance-container">
      <header className="compliance-header">
        <h2>Contribution Compliance Report</h2>
        <p>Track your payment consistency and history over time</p>
      </header>

      <article className="compliance-score-card">
        <div className="score-circle">
          <span className="score-value">{complianceData.complianceRate}%</span>
          <span className="score-label">Compliance Rate</span>
        </div>
        <div className="score-message">
          <p className={`score-status ${complianceColor}`}>{complianceMessage}</p>
        </div>
      </article>

      <section className="compliance-summary-cards">
        <article className="compliance-summary-card">
          <h3>Total Expected</h3>
          <p className="summary-number">{complianceData.totalExpected}</p>
          <small>payments</small>
        </article>
        <article className="compliance-summary-card">
          <h3>Payments Made</h3>
          <p className="summary-number success">{complianceData.totalPaid}</p>
          <small>payments</small>
        </article>
        <article className="compliance-summary-card">
          <h3>On-Time Rate</h3>
          <p className="summary-number">{complianceData.onTimeRate}%</p>
          <small>of payments</small>
        </article>
        <article className="compliance-summary-card warning">
          <h3>Missed Payments</h3>
          <p className="summary-number warning">{complianceData.missedPayments}</p>
          <small>payments</small>
        </article>
      </section>

      <section className="compliance-table-wrapper">
        <h3>Monthly Breakdown</h3>
        <table className="compliance-table">
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Expected</th>
              <th scope="col">Paid</th>
              <th scope="col">Due Date</th>
              <th scope="col">Payment Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {complianceData.monthlyBreakdown && complianceData.monthlyBreakdown.length > 0 ? (
              complianceData.monthlyBreakdown.map((month, index) => (
                <tr key={index} className={`status-${month.status}`}>
                  <td><strong>{month.month}</strong></td>
                  <td>{formatCurrency(month.expected)}</td>
                  <td>{month.paid > 0 ? formatCurrency(month.paid) : '-'}</td>
                  <td>{month.dueDate || 'N/A'}</td>
                  <td>{month.paymentDate ? formatDate(month.paymentDate) : '-'}</td>
                  <td>
                    <span className={`compliance-status-badge ${month.status}`}>
                      {month.status === 'on-time' ? 'On Time' : 
                       month.status === 'late' ? 'Late' : 'Missed'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data-cell">No monthly data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="recommendations-section">
        <h3>Recommendations</h3>
        <ul className="recommendations-list">
          {complianceData.complianceRate < 75 && (
            <li>Set up payment reminders to avoid missing contributions.</li>
          )}
          {complianceData.missedPayments > 0 && (
            <li>You have {complianceData.missedPayments} missed payment(s). Contact your treasurer to catch up.</li>
          )}
          {complianceData.onTimeRate < 80 && (
            <li>Consider scheduling automatic payments to improve on-time rate.</li>
          )}
          {complianceData.complianceRate >= 90 && (
            <li>Excellent work! You are a highly reliable member.</li>
          )}
          <li>Review your contribution schedule and plan ahead for upcoming payments.</li>
        </ul>
      </section>
    </section>
  );
};

export default ContributionCompliance;
