import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemberPayoutView.css'; 

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const MemberPayoutView = ({ user, members = [], groupId, groupName, contributionAmount }) => {
  const navigate = useNavigate();

  const [payoutHistory, setPayoutHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const currentUserEmail = user?.email || JSON.parse(sessionStorage.getItem('user'))?.email;

  const projectedSchedule = useMemo(() => {
    const hasRealMembers = members && members.length > 0;
    
    const baselineMembers = hasRealMembers 
      ? members 
      : [
          { _id: 'fallback-m1', fullName: 'Member Rotation Slot 1', userEmail: 'rotation_slot1@stokkie.co.za' },
          { _id: 'fallback-m2', fullName: 'Member Rotation Slot 2', userEmail: 'rotation_slot2@stokkie.co.za' },
          { _id: 'fallback-m3', fullName: 'Member Rotation Slot 3', userEmail: 'rotation_slot3@stokkie.co.za' }
        ];

    let baseDate = new Date(); 
    
    return baselineMembers.map((member, index) => {
      let payoutDate = new Date(baseDate);
      payoutDate.setMonth(payoutDate.getMonth() + index + 1);
      
      return {
        memberId: member._id,
        fullName: member.fullName || member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Stokvel Member',
        userEmail: member.userEmail || member.email || 'N/A',
        projectedDate: payoutDate
      };
    });
  }, [members]);

  const upcomingProjection = useMemo(() => {
    if (projectedSchedule.length === 0) return null;

    const nextPendingInHistory = payoutHistory.find(p => p.status === 'pending');

    if (nextPendingInHistory) {
      const targetEmail = (nextPendingInHistory.recipientEmail || nextPendingInHistory.memberEmail || nextPendingInHistory.userEmail || '').toLowerCase();
      const matchedSlot = projectedSchedule.find(slot => slot.userEmail.toLowerCase() === targetEmail);
      
      if (matchedSlot) {
        return matchedSlot;
      }
    }

    return projectedSchedule[0];
  }, [projectedSchedule, payoutHistory]);


  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/payouts/${groupName}/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const myPayouts = data.filter(p => {
              const recordEmail = String(p.recipientEmail || p.memberEmail || p.userEmail || p.email || '').toLowerCase();
              return recordEmail === String(currentUserEmail).toLowerCase();
            });
            setPayoutHistory(myPayouts);
          }
        }
      } catch (err) {
        console.error("Failed to fetch payout history:", err);
      } finally { 
        setHistoryLoading(false);
      }
    };
    if (groupName && currentUserEmail) fetchHistory();
  }, [groupName, currentUserEmail]);


  return (
    <main className="po-page">
      {/* Top Bar Label */}
      <nav className="po-topbar" aria-label="Page navigation">
        <span className="po-page-label" style={{ paddingLeft: '0' }}>Member · Payout Tracking</span>
      </nav>

      <article className="po-card po-card--suggestion" aria-label="Upcoming Payout Projection">
        <header className="po-card-header">
          <span className="po-badge-label" style={{ backgroundColor: '#0284c7' }}>Upcoming Payout Rotation</span>
        </header>

        <section className="po-suggestion-body">
          {historyLoading ? (
            <p className="po-loading">Calculating upcoming rotation cycle…</p>
          ) : upcomingProjection ? (
            <figure className="po-suggestion-info">
              <span className="po-avatar po-avatar--lg" style={{ backgroundColor: '#0284c7' }} aria-hidden="true">
                {(upcomingProjection.fullName || '?')[0].toUpperCase()}
              </span>
              <figcaption className="po-suggestion-details">
                <p className="po-suggestion-name">Next Recipient: <strong>{upcomingProjection.fullName}</strong></p>
                <p className="po-suggestion-email">{upcomingProjection.userEmail}</p>
                
                <p className="po-suggestion-date" style={{ margin: '6px 0', color: '#475569' }}>
                  Target Payout Date:{' '}
                  <span style={{ color: '#0284c7', fontWeight: '600' }}>
                    {upcomingProjection.projectedDate.toLocaleDateString('en-ZA', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </p>

                <p className="po-suggestion-amount">
                  Lump Sum Disbursal: <strong>R {parseFloat(contributionAmount || 0).toFixed(2)}</strong>
                </p>
              </figcaption>
            </figure>
          ) : (
            <p className="po-empty">No upcoming scheduled members discovered in this group.</p>
          )}
        </section>
      </article>

      {/* ── SECTION 2: PERSONAL PAYOUT HISTORY (BOTTOM CARD) ────────────────── */}
      <article className="po-card po-card--table" aria-label="Payout History">
        <header className="po-card-header">
          <h2 className="po-card-title">My Payout History</h2>
          <p className="po-card-sub">Track all previous and ongoing disbursements allocated directly to you.</p>
        </header>

        {historyLoading ? (
          <p className="po-loading">Loading payout history…</p>
        ) : payoutHistory.length === 0 ? (
          <p className="po-empty">You haven't received any payouts within this Stokvel group yet.</p>
        ) : (
          <section className="po-table-wrap">
            <table className="po-table">
              <thead>
                <tr>
                  <th scope="col">Date Issued</th>
                  <th scope="col">Amount Received</th>
                  <th scope="col">Method</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((p) => (
                  <tr key={p._id}>
                    <td>
                      {p.createdAt || p.payoutDate 
                        ? new Date(p.createdAt || p.payoutDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        : 'Recent'}
                    </td>
                    <td>R {p.amount ? parseFloat(p.amount).toFixed(2) : parseFloat(contributionAmount).toFixed(2)}</td>
                    <td>{p.method === 'bank' ? 'Bank Transfer' : 'Cash'}</td>
                    <td>
                      <span className={`po-status-pill po-status-pill--${p.status}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </article>
    </main>
  );
};