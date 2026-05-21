import React, { useState, useEffect } from 'react';
import './ContributionCompliance.css';

const ContributionCompliance = ({ user, groupName: initialGroupName }) => {
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupContributionAmounts, setGroupContributionAmounts] = useState({});

  const sessionUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const userEmail = user?.email || sessionUser.email;

  useEffect(() => {
    if (userEmail) {
      fetchAllPayments();
    }
  }, [userEmail]);

  const fetchAllPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments/${userEmail}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }
      
      const data = await response.json();
      const payments = data.payments || [];
      
      setAllPayments(payments);
      
      const uniqueGroups = [...new Set(payments.map(p => p.groupName).filter(Boolean))];
      
      if (uniqueGroups.length === 0) {
        setError('You are not a member of any groups yet. Join a group to see compliance data.');
        setLoading(false);
        return;
      }
      
      setGroups(uniqueGroups);
      
      const amounts = {};
      for (const groupName of uniqueGroups) {
        const groupPayments = payments.filter(p => p.groupName === groupName);
        if (groupPayments.length > 0) {
          const paymentAmounts = groupPayments.map(p => p.amount);
          const mostCommon = getMostCommonValue(paymentAmounts);
          amounts[groupName] = mostCommon || 500;
        } else {
          amounts[groupName] = 500;
        }
      }
      
      setGroupContributionAmounts(amounts);
      
      let defaultGroup = uniqueGroups[0];
      if (initialGroupName && uniqueGroups.includes(initialGroupName)) {
        defaultGroup = initialGroupName;
      }
      setSelectedGroup(defaultGroup);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(`Unable to load data: ${error.message}`);
      setLoading(false);
    }
  };

  const getMostCommonValue = (arr) => {
    if (arr.length === 0) return null;
    const frequency = {};
    let maxFreq = 0;
    let mostCommon = arr[0];
    
    for (const value of arr) {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mostCommon = value;
      }
    }
    return mostCommon;
  };

  useEffect(() => {
    if (selectedGroup && allPayments.length > 0) {
      generateComplianceReport(selectedGroup);
    }
  }, [selectedGroup, allPayments]);

  const generateComplianceReport = (groupName) => {
    const groupPayments = allPayments.filter(p => p.groupName === groupName);
    
    if (groupPayments.length === 0) {
      setMonthlyBreakdown([]);
      return;
    }
    
    const contributionAmount = groupContributionAmounts[groupName] || 500;
    const sortedPayments = [...groupPayments].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstDate = new Date(sortedPayments[0].date);
    const totalPaidAmount = sortedPayments.reduce((sum, p) => sum + p.amount, 0);
    const monthsCovered = Math.ceil(totalPaidAmount / contributionAmount);
    
    const months = [];
    for (let i = 0; i < monthsCovered; i++) {
      const date = new Date(firstDate.getFullYear(), firstDate.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' });
      
      months.push({
        monthName,
        expected: contributionAmount,
        paid: 0,
        dueDate: new Date(date.getFullYear(), date.getMonth(), 28).toLocaleDateString('en-ZA'),
        paymentDate: null,
        paymentDates: [],
        status: 'pending',
        notes: '',
        payments: []
      });
    }
    
    let paymentIndex = 0;
    let carryOver = 0;
    
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      let totalForMonth = carryOver;
      
      while (paymentIndex < sortedPayments.length && totalForMonth < month.expected) {
        const payment = sortedPayments[paymentIndex];
        totalForMonth += payment.amount;
        month.payments.push(payment);
        month.paymentDates.push(payment.date);
        paymentIndex++;
      }
      
      if (totalForMonth >= month.expected) {
        month.paid = month.expected;
        month.status = 'on-time';
        carryOver = totalForMonth - month.expected;
        
        if (month.paymentDates.length > 0) {
          month.paymentDate = month.paymentDates[month.paymentDates.length - 1];
        }
        
        if (month.payments.length > 1) {
          month.notes = `${month.payments.length} payments totalling ${formatCurrency(totalForMonth)}. Made on time.`;
        } else {
          month.notes = `Payment of ${formatCurrency(totalForMonth)}. Made on time.`;
        }
        
        if (carryOver > 0) {
          month.notes += ` Excess of ${formatCurrency(carryOver)} applied to next month.`;
        }
      } else if (totalForMonth > 0) {
        month.paid = totalForMonth;
        month.status = 'partial';
        if (month.paymentDates.length > 0) {
          month.paymentDate = month.paymentDates[month.paymentDates.length - 1];
        }
        month.notes = `Partial payment of ${formatCurrency(totalForMonth)}. Remaining: ${formatCurrency(month.expected - totalForMonth)}`;
        carryOver = 0;
      }
    }
    
    const allPaymentDates = sortedPayments.map(p => p.date);
    const latestPaymentDate = allPaymentDates[allPaymentDates.length - 1];
    
    let foundLastDirectPayment = false;
    for (let i = months.length - 1; i >= 0; i--) {
      const month = months[i];
      if (month.paymentDate) {
        foundLastDirectPayment = true;
      } else if (!foundLastDirectPayment) {
        month.paymentDate = latestPaymentDate;
      } else {
        for (let j = i + 1; j < months.length; j++) {
          if (months[j].paymentDate) {
            month.paymentDate = months[j].paymentDate;
            break;
          }
        }
      }
    }
    
    let lastKnownDate = null;
    for (let i = 0; i < months.length; i++) {
      if (months[i].paymentDate) {
        lastKnownDate = months[i].paymentDate;
      } else if (lastKnownDate) {
        months[i].paymentDate = lastKnownDate;
      }
    }
    
    setMonthlyBreakdown([...months].reverse());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const totalExpected = monthlyBreakdown.reduce((sum, month) => sum + month.expected, 0);
  const totalPaid = monthlyBreakdown.reduce((sum, month) => sum + month.paid, 0);
  const totalPaymentsMade = monthlyBreakdown.filter(month => month.paid > 0).length;
  const totalExpectedPayments = monthlyBreakdown.length;
  const missedPayments = monthlyBreakdown.filter(month => month.status === 'missed').length;
  const onTimePayments = monthlyBreakdown.filter(month => month.status === 'on-time').length;
  const onTimeRate = totalPaymentsMade > 0 ? Math.round((onTimePayments / totalPaymentsMade) * 100) : 0;
  const complianceRate = totalExpected > 0 ? Math.min(Math.round((totalPaid / totalExpected) * 100), 100) : 0;

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
        <button type="button" onClick={() => fetchAllPayments()} className="retry-button">
          Try Again
        </button>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section className="compliance-container">
        <p className="no-data-text">You are not a member of any groups yet. Join a group to see your compliance report.</p>
      </section>
    );
  }

  const complianceColor = getComplianceColor(complianceRate);
  const complianceMessage = getComplianceMessage(complianceRate);
  const currentContributionAmount = groupContributionAmounts[selectedGroup] || 500;

  return (
    <main className="compliance-container">
      <header className="compliance-header">
        <h1>Contribution Compliance Report</h1>
        <p>Track your payment consistency across all your stokvel groups</p>
      </header>

      <section className="group-selector">
        <label htmlFor="groupSelect">Select Group:</label>
        <select 
          id="groupSelect"
          value={selectedGroup || ''} 
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="group-select"
        >
          {groups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </section>

      {selectedGroup && monthlyBreakdown.length > 0 && (
        <>
          <article className="compliance-score-card">
            <header className="score-circle">
              <p className="score-value">{complianceRate}%</p>
              <p className="score-label">Compliance Rate</p>
            </header>
            <footer className="score-message">
              <p className={`score-status ${complianceColor}`}>{complianceMessage}</p>
            </footer>
          </article>

          <section className="compliance-summary-cards single-line">
            <article className="compliance-summary-card">
              <h2>Total Expected</h2>
              <p className="summary-number">{formatCurrency(totalExpected)}</p>
              <small>payments ({formatCurrency(currentContributionAmount)}/month)</small>
            </article>
            
            <article className="compliance-summary-card">
              <h2>Payments Made</h2>
              <p className="summary-number success">{totalPaymentsMade}</p>
              <small>of {totalExpectedPayments} months</small>
            </article>
            
            <article className="compliance-summary-card">
              <h2>Total Amount Paid</h2>
              <p className="summary-number success">{formatCurrency(totalPaid)}</p>
              <small>out of {formatCurrency(totalExpected)}</small>
            </article>
            
            <article className="compliance-summary-card">
              <h2>On-Time Rate</h2>
              <p className="summary-number">{onTimeRate}%</p>
              <small>of payments</small>
            </article>
            
            <article className="compliance-summary-card warning">
              <h2>Missed Payments</h2>
              <p className="summary-number warning">{missedPayments}</p>
              <small>payments</small>
            </article>
          </section>

          <section className="compliance-table-wrapper">
            <h2>Monthly Breakdown - {selectedGroup}</h2>
            <figure className="table-responsive">
              <table className="compliance-table">
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Expected</th>
                    <th scope="col">Paid</th>
                    <th scope="col">Due Date</th>
                    <th scope="col">Payment Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.map((month, index) => (
                    <tr key={index} className={`status-${month.status}`}>
                      <th scope="row"><strong>{month.monthName}</strong></th>
                      <td>{formatCurrency(month.expected)}</td>
                      <td>
                        {month.paid > 0 ? formatCurrency(month.paid) : '-'}
                        {month.payments && month.payments.length > 1 && (
                          <small className="multiple-payments-note"> ({month.payments.length} payments)</small>
                        )}
                      </td>
                      <td>{month.dueDate}</td>
                      <td>{formatDate(month.paymentDate)}</td>
                      <td>
                        <span className={`compliance-status-badge ${month.status}`}>
                          {month.status === 'on-time' ? 'On Time' : 
                           month.status === 'partial' ? 'Partial' : 'Missed'}
                        </span>
                      </td>
                      <td>
                        <span className="notes-text">{month.notes}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {totalPaid > 0 && (
                  <tfoot>
                    <tr className="table-footer">
                      <th scope="row" style={{ textAlign: 'right' }}>Totals:</th>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(totalExpected)}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(totalPaid)}</td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
              <figcaption className="visually-hidden">Monthly contribution breakdown for {selectedGroup}</figcaption>
            </figure>
          </section>

          <section className="recommendations-section">
            <h2>Recommendations</h2>
            <ul className="recommendations-list">
              {complianceRate < 75 && totalExpected > 0 && (
                <li>Set up payment reminders to avoid missing contributions.</li>
              )}
              {missedPayments > 0 && (
                <li>You have {missedPayments} missed payment(s). Contact your treasurer to catch up.</li>
              )}
              {onTimeRate < 80 && totalPaymentsMade > 0 && (
                <li>Consider scheduling automatic payments to improve on-time rate.</li>
              )}
              {complianceRate >= 90 && totalExpected > 0 && (
                <li>Excellent work! You are a highly reliable member.</li>
              )}
              {currentContributionAmount > 0 && (
                <li>Your monthly contribution is {formatCurrency(currentContributionAmount)}. Payments are due by the 28th of each month.</li>
              )}
              <li>Review your contribution schedule and plan ahead for upcoming payments.</li>
            </ul>
          </section>
        </>
      )}
    </main>
  );
};

export default ContributionCompliance;
