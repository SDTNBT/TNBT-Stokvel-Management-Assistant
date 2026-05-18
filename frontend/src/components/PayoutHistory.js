import React, { useEffect, useState } from 'react';
import { getMemberPayouts } from '../services/payoutService';

const PayoutHistory = ({ user }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userEmail = user?.email || sessionUser.email;

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        setError('');

        if (!userEmail) {
          throw new Error('User email not found. Please log in again.');
        }

        const data = await getMemberPayouts(userEmail);
        setPayouts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load payout history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [userEmail]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    return new Date(dateValue).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase();

    if (statusLower === 'paid') {
      return {
        background: '#e8f5e9',
        color: '#2e7d32'
      };
    }

    if (statusLower === 'cancelled' || statusLower === 'failed') {
      return {
        background: '#ffebee',
        color: '#c62828'
      };
    }

    if (statusLower === 'processing') {
      return {
        background: '#fff8e1',
        color: '#f57c00'
      };
    }

    return {
      background: '#e3f2fd',
      color: '#1565c0'
    };
  };

  if (loading) {
    return (
      <section style={containerStyle}>
        <p>Loading payout history...</p>
      </section>
    );
  }

  return (
    <section style={containerStyle}>
      <header style={{ marginBottom: '18px' }}>
        <h2 style={{ margin: 0 }}>Payout History</h2>
        <p style={{ color: '#666', marginTop: '6px' }}>
          View payouts scheduled or paid directly to your saved bank account.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          style={{
            padding: '12px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '8px'
          }}
        >
          {error}
        </p>
      )}

      {!error && payouts.length === 0 && (
        <p style={{ color: '#666' }}>
          No payouts have been scheduled for you yet.
        </p>
      )}

      {!error && payouts.length > 0 && (
        <section style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <caption style={captionStyle}>
              List of payouts linked to your banking details
            </caption>

            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Group</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Bank</th>
                <th style={thStyle}>Account</th>
                <th style={thStyle}>Reference</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {payouts.map((payout) => {
                const statusStyle = getStatusStyle(payout.status);

                return (
                  <tr key={payout._id}>
                    <td style={tdStyle}>{formatDate(payout.payoutDate)}</td>
                    <td style={tdStyle}>{payout.groupName}</td>
                    <td style={tdStyle}>
                      <strong>{formatCurrency(payout.amount)}</strong>
                    </td>
                    <td style={tdStyle}>{payout.bankName || 'N/A'}</td>
                    <td style={tdStyle}>
                      {payout.accountNumberLast4
                        ? `**** ${payout.accountNumberLast4}`
                        : 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      <small>{payout.paymentReference || 'N/A'}</small>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          ...statusStyle
                        }}
                      >
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </section>
  );
};

const containerStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  marginTop: '20px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px'
};

const captionStyle = {
  textAlign: 'left',
  marginBottom: '10px',
  color: '#666'
};

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #ddd',
  background: '#f8fafc'
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #eee'
};

const statusBadgeStyle = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '600'
};

export default PayoutHistory;