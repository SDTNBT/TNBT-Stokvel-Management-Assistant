import React, { useState, useEffect } from 'react';
import './ContributionCompliance.css';

const ContributionCompliance = ({ user, groupName: initialGroupName }) => {
  const [allPayments, setAllPayments] = useState([]);
  const [allMemberships, setAllMemberships] = useState([]);
  const [groupDetails, setGroupDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  const sessionUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const userEmail = user?.email || sessionUser.email;

  useEffect(() => {
    if (userEmail) {
      fetchUserData();
    }
  }, [userEmail]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const membershipsResponse = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/stokvel/user/${userEmail}`);
      
      if (!membershipsResponse.ok) {
        throw new Error(`Failed to fetch memberships: ${membershipsResponse.status}`);
      }
      
      const memberships = await membershipsResponse.json();
      setAllMemberships(memberships);
      
      if (memberships.length === 0) {
        setGroups([]);
        setSelectedGroup(null);
        setLoading(false);
        return;
      }
      
      const uniqueGroups = memberships.map(m => m.groupName);
      setGroups(uniqueGroups);
      
      const groupDetailsMap = {};
      for (const membership of memberships) {
        groupDetailsMap[membership.groupName] = {
          contributionAmount: membership.contributionAmount,
          frequency: membership.frequency || 'Monthly',
          userRole: membership.userRole
        };
      }
      setGroupDetails(groupDetailsMap);
      
      let defaultGroup = uniqueGroups[0];
      if (initialGroupName && uniqueGroups.includes(initialGroupName)) {
        defaultGroup = initialGroupName;
      }
      setSelectedGroup(defaultGroup);
      
      const paymentsResponse = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments/${userEmail}`);
      
      if (!paymentsResponse.ok) {
        throw new Error(`Failed to fetch payments: ${paymentsResponse.status}`);
      }
      
      const paymentsData = await paymentsResponse.json();
      const payments = paymentsData.payments || [];
      setAllPayments(payments);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Unable to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroup && allPayments.length > 0) {
      generateComplianceReport(selectedGroup);
    } else if (selectedGroup && allPayments.length === 0) {
      setMonthlyBreakdown([]);
    }
  }, [selectedGroup, allPayments]);

  const generateComplianceReport = (groupName) => {
    const groupPayments = allPayments.filter(p => p.groupName === groupName);
    const groupInfo = groupDetails[groupName];
    
    if (!groupInfo) {
      setMonthlyBreakdown([]);
      return;
    }
    
    const contributionAmount = groupInfo.contributionAmount;
    const frequency = groupInfo.frequency;
    const isWeekly = frequency === 'Weekly';
    
    const sortedPayments = [...groupPayments].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedPayments.length === 0) {
      setMonthlyBreakdown([]);
      return;
    }
    
    const firstDate = new Date(sortedPayments[0].date);
    const totalPaidAmount = sortedPayments.reduce((sum, p) => sum + p.amount, 0);
    const periodsCovered = Math.ceil(totalPaidAmount / contributionAmount);
    
    const periods = [];
    for (let i = 0; i < periodsCovered; i++) {
      let periodName;
      let dueDay;
      
      if (isWeekly) {
        const date = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + (i * 7));
        periodName = `Week of ${date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        dueDay = 7;
      } else {
        const date = new Date(firstDate.getFullYear(), firstDate.getMonth() + i, 1);
        periodName = date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' });
        dueDay = 28;
      }
      
      periods.push({
        periodName,
        expected: contributionAmount,
        paid: 0,
        dueDate: isWeekly 
          ? new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + (i * 7) + dueDay).toLocaleDateString('en-ZA')
          : new Date(firstDate.getFullYear(), firstDate.getMonth() + i, dueDay).toLocaleDateString('en-ZA'),
        paymentDate: null,
        paymentDates: [],
        status: 'pending',
        notes: '',
        payments: []
      });
    }
    
    let paymentIndex = 0;
    let carryOver = 0;
    
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      let totalForPeriod = carryOver;
      
      while (paymentIndex < sortedPayments.length && totalForPeriod < period.expected) {
        const payment = sortedPayments[paymentIndex];
        totalForPeriod += payment.amount;
        period.payments.push(payment);
        period.paymentDates.push(payment.date);
        paymentIndex++;
      }
      
      if (totalForPeriod >= period.expected) {
        period.paid = period.expected;
        period.status = 'on-time';
        carryOver = totalForPeriod - period.expected;
        
        if (period.paymentDates.length > 0) {
          period.paymentDate = period.paymentDates[period.paymentDates.length - 1];
        }
        
        if (period.payments.length > 1) {
          period.notes = `${period.payments.length} payments totalling ${formatCurrency(totalForPeriod)}. Made on time.`;
        } else {
          period.notes = `Payment of ${formatCurrency(totalForPeriod)}. Made on time.`;
        }
        
        if (carryOver > 0) {
          period.notes += ` Excess of ${formatCurrency(carryOver)} applied to next ${isWeekly ? 'week' : 'month'}.`;
        }
      } else if (totalForPeriod > 0) {
        period.paid = totalForPeriod;
        period.status = 'partial';
        if (period.paymentDates.length > 0) {
          period.paymentDate = period.paymentDates[period.paymentDates.length - 1];
        }
        period.notes = `Partial payment of ${formatCurrency(totalForPeriod)}. Remaining: ${formatCurrency(period.expected - totalForPeriod)}`;
        carryOver = 0;
      }
    }
    
    const allPaymentDates = sortedPayments.map(p => p.date);
    const latestPaymentDate = allPaymentDates[allPaymentDates.length - 1];
    
    let foundLastDirectPayment = false;
    for (let i = periods.length - 1; i >= 0; i--) {
      const period = periods[i];
      if (period.paymentDate) {
        foundLastDirectPayment = true;
      } else if (!foundLastDirectPayment) {
        period.paymentDate = latestPaymentDate;
      } else {
        for (let j = i + 1; j < periods.length; j++) {
          if (periods[j].paymentDate) {
            period.paymentDate = periods[j].paymentDate;
            break;
          }
        }
      }
    }
    
    let lastKnownDate = null;
    for (let i = 0; i < periods.length; i++) {
      if (periods[i].paymentDate) {
        lastKnownDate = periods[i].paymentDate;
      } else if (lastKnownDate) {
        periods[i].paymentDate = lastKnownDate;
      }
    }
    
    setMonthlyBreakdown([...periods].reverse());
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

  const totalExpected = monthlyBreakdown.reduce((sum, period) => sum + period.expected, 0);
  const totalPaid = monthlyBreakdown.reduce((sum, period) => sum + period.paid, 0);
  const totalPaymentsMade = monthlyBreakdown.filter(period => period.paid > 0).length;
  const totalExpectedPayments = monthlyBreakdown.length;
  const missedPayments = monthlyBreakdown.filter(period => period.status === 'pending' || period.status === 'missed').length;
  const onTimePayments = monthlyBreakdown.filter(period => period.status === 'on-time').length;
  const onTimeRate = totalPaymentsMade > 0 ? Math.round((onTimePayments / totalPaymentsMade) * 100) : 0;
  const complianceRate = totalExpected > 0 ? Math.min(Math.round((totalPaid / totalExpected) * 100), 100) : 0;

  if (loading) {
    return (
      <main className="compliance-container">
        <p className="loading-text">Loading compliance report...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="compliance-container">
        <p className="error-text">{error}</p>
      </main>
    );
  }

  const hasNoGroups = groups.length === 0;
  const hasNoPayments = allPayments.length === 0;
  const hasMonthlyData = monthlyBreakdown.length > 0;
  const currentGroupInfo = groupDetails[selectedGroup];
  const currentContributionAmount = currentGroupInfo?.contributionAmount || 0;
  const currentFrequency = currentGroupInfo?.frequency || 'Monthly';

  if (hasNoGroups) {
    return (
      <main className="compliance-container">
        <p className="no-data-text">You are not a member of any groups yet. Join a group to see your compliance report.</p>
      </main>
    );
  }

  const complianceColor = getComplianceColor(complianceRate);
  const complianceMessage = getComplianceMessage(complianceRate);

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

      {selectedGroup && currentGroupInfo && (
        <>
          <article className="compliance-score-card">
            <header className="score-circle">
              <p className="score-value">{hasNoPayments ? 0 : complianceRate}%</p>
              <p className="score-label">Compliance Rate</p>
            </header>
            <footer className="score-message">
              <p className={`score-status ${hasNoPayments ? 'poor' : complianceColor}`}>
                {hasNoPayments ? 'No payments recorded yet' : complianceMessage}
              </p>
            </footer>
          </article>

          <section className="compliance-summary-cards single-line">
            <article className="compliance-summary-card">
              <h2>Total Expected</h2>
              <p className="summary-number">{formatCurrency(totalExpected)}</p>
              <small>{currentFrequency} contribution ({formatCurrency(currentContributionAmount)}/{currentFrequency === 'Weekly' ? 'week' : 'month'})</small>
            </article>
            
            <article className="compliance-summary-card">
              <h2>Payments Made</h2>
              <p className="summary-number success">{totalPaymentsMade}</p>
              <small>of {totalExpectedPayments} {currentFrequency === 'Weekly' ? 'weeks' : 'months'}</small>
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
              <small>{currentFrequency === 'Weekly' ? 'weeks' : 'months'}</small>
            </article>
          </section>

          <section className="compliance-table-wrapper">
            <h2>Breakdown - {selectedGroup}</h2>
            <figure className="table-responsive">
              {hasMonthlyData ? (
                <table className="compliance-table">
                  <thead>
                    <tr>
                      <th scope="col">{currentFrequency === 'Weekly' ? 'Week' : 'Month'}</th>
                      <th scope="col">Expected</th>
                      <th scope="col">Paid</th>
                      <th scope="col">Due Date</th>
                      <th scope="col">Payment Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map((period, index) => (
                      <tr key={index} className={`status-${period.status}`}>
                        <th scope="row"><strong>{period.periodName}</strong></th>
                        <td>{formatCurrency(period.expected)}</td>
                        <td>
                          {period.paid > 0 ? formatCurrency(period.paid) : '-'}
                          {period.payments && period.payments.length > 1 && (
                            <small className="multiple-payments-note"> ({period.payments.length} payments)</small>
                          )}
                        </td>
                        <td>{period.dueDate}</td>
                        <td>{formatDate(period.paymentDate)}</td>
                        <td>
                          <span className={`compliance-status-badge ${period.status}`}>
                            {period.status === 'on-time' ? 'On Time' : 
                             period.status === 'partial' ? 'Partial' : 'Missed'}
                          </span>
                        </td>
                        <td>
                          <span className="notes-text">{period.notes}</span>
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
              ) : (
                <section className="no-payments-placeholder">
                  <p className="no-data-text">No payment data available for {selectedGroup}. Make your first payment to see the breakdown.</p>
                </section>
              )}
              <figcaption className="visually-hidden">Contribution breakdown for {selectedGroup}</figcaption>
            </figure>
          </section>

          <section className="recommendations-section">
            <h2>Recommendations</h2>
            <ul className="recommendations-list">
              {hasNoPayments && (
                <li>Make your first payment of {formatCurrency(currentContributionAmount)} to start building your compliance history.</li>
              )}
              {!hasNoPayments && complianceRate < 75 && totalExpected > 0 && (
                <li>Set up payment reminders to avoid missing {currentFrequency === 'Weekly' ? 'weekly' : 'monthly'} contributions of {formatCurrency(currentContributionAmount)}.</li>
              )}
              {!hasNoPayments && missedPayments > 0 && (
                <li>You have {missedPayments} missed {currentFrequency === 'Weekly' ? 'weeks' : 'months'}. Contact your treasurer to catch up on {formatCurrency(missedPayments * currentContributionAmount)}.</li>
              )}
              {!hasNoPayments && onTimeRate < 80 && totalPaymentsMade > 0 && (
                <li>Consider scheduling automatic payments to improve your on-time rate for {currentFrequency === 'Weekly' ? 'weekly' : 'monthly'} contributions.</li>
              )}
              {!hasNoPayments && complianceRate >= 90 && totalExpected > 0 && (
                <li>Excellent work! You are a highly reliable member. Keep up the {currentFrequency === 'Weekly' ? 'weekly' : 'monthly'} contributions of {formatCurrency(currentContributionAmount)}.</li>
              )}
              {currentContributionAmount > 0 && (
                <li>Your {currentFrequency === 'Weekly' ? 'weekly' : 'monthly'} contribution is {formatCurrency(currentContributionAmount)}. Payments are due by the {currentFrequency === 'Weekly' ? 'end of each week' : '28th of each month'}.</li>
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
