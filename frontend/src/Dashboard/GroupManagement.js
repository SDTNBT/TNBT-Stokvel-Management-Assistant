import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ViewMembers from './ViewMembers';
import MemberDetails from './MemberDetails';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GroupManagement = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/managegroup/${groupId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setMembers(data.members || []);
          setGroupData(data.group);
        } else {
          setError('Failed to load group data.');
        }
      } catch (err) {
        setError('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (groupId) loadData();
  }, [groupId]);

  const handleRemove = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/managegroup/${groupId}/member/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMembers(prev => prev.filter(m => m._id !== memberId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div style={shellStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#718096', marginTop: '12px' }}>Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>

      {/* ── HEADER ── */}
      <header style={headerStyle}>
        <button style={backBtnStyle} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div style={headerCenterStyle}>
          <h1 style={headerTitleStyle}>Group Management</h1>
          {groupData?.groupName && (
            <span style={groupBadgeStyle}>{groupData.groupName}</span>
          )}
        </div>

        <div style={headerRightStyle}>
          {groupData && (
            <span style={memberCountStyle}>
              {members.length} Member{members.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={mainStyle}>

        {error && (
          <div style={errorStyle} role="alert">{error}</div>
        )}

        {/* Member Details View */}
        {selectedMember ? (
          <MemberDetails
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onRemove={handleRemove}
          />
        ) : (
          /* Members List */
          <div style={contentCardStyle}>

            <header style={cardHeaderStyle}>
              <div>
                <h2 style={cardTitleStyle}>Members</h2>
                <p style={cardSubStyle}>
                  Click on a member to view their details or remove them from the group.
                </p>
              </div>
            </header>

            {members.length === 0 ? (
              <div style={emptyStyle}>
                <p style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👥</p>
                <p style={{ color: '#a0aec0', fontSize: '0.95rem', fontWeight: '500' }}>
                  No members found in this group.
                </p>
              </div>
            ) : (
              <div style={membersListStyle}>
                {members.map((member, index) => (
                  <div
                    key={member._id || index}
                    style={memberRowStyle}
                    onClick={() => setSelectedMember(member)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* Avatar */}
                    <div style={avatarStyle(member.memberType)}>
                      {(member.fullName || member.userEmail || '?')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={memberNameStyle}>
                        {member.fullName || 'No name set'}
                      </p>
                      <p style={memberEmailStyle}>
                        {member.userEmail}
                      </p>
                    </div>

                    {/* Role Badge */}
                    <span style={roleBadgeStyle(member.memberType)}>
                      {member.memberType || 'Member'}
                    </span>

                    {/* Arrow */}
                    <span style={{ color: '#cbd5e0', fontSize: '1.1rem', flexShrink: 0 }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ── STYLES 
const shellStyle = {
  minHeight: '100vh',
  background: '#f4f6fb',
  fontFamily: "'Inter', 'Segoe UI', sans-serif"
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh'
};

const spinnerStyle = {
  width: '36px',
  height: '36px',
  border: '3px solid #e2e8f0',
  borderTopColor: '#6366f1',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite'
};

const headerStyle = {
  background: '#1a1a2e',
  padding: '16px 28px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};

const backBtnStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const headerCenterStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap'
};

const headerTitleStyle = {
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#ffffff'
};

const groupBadgeStyle = {
  background: 'rgba(99,102,241,0.25)',
  color: '#a5b4fc',
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '600'
};

const headerRightStyle = {
  flexShrink: 0
};

const memberCountStyle = {
  background: 'rgba(255,255,255,0.1)',
  color: '#e2e8f0',
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '600'
};

const mainStyle = {
  maxWidth: '860px',
  margin: '0 auto',
  padding: '28px 20px'
};

const errorStyle = {
  background: '#ffebee',
  color: '#c62828',
  padding: '12px 16px',
  borderRadius: '10px',
  marginBottom: '20px',
  fontSize: '14px'
};

const contentCardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)',
  overflow: 'hidden'
};

const cardHeaderStyle = {
  padding: '22px 24px',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
};

const cardTitleStyle = {
  margin: '0 0 4px',
  fontSize: '1.05rem',
  fontWeight: '700',
  color: '#1a202c'
};

const cardSubStyle = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#718096'
};

const emptyStyle = {
  textAlign: 'center',
  padding: '48px 24px'
};

const membersListStyle = {
  padding: '0'
};

const memberRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 24px',
  borderBottom: '1px solid #f7f8fa',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  background: '#ffffff'
};

const avatarStyle = (memberType) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: memberType === 'Admin' ? '#eef2ff' :
               memberType === 'Treasurer' ? '#fef3c7' : '#f0fdf4',
  color: memberType === 'Admin' ? '#6366f1' :
         memberType === 'Treasurer' ? '#d97706' : '#16a34a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '15px',
  fontWeight: '700',
  flexShrink: 0
});

const memberNameStyle = {
  margin: '0 0 2px',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#1a202c',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const memberEmailStyle = {
  margin: 0,
  fontSize: '0.8rem',
  color: '#718096',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const roleBadgeStyle = (memberType) => ({
  padding: '3px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '700',
  flexShrink: 0,
  background: memberType === 'Admin' ? '#eef2ff' :
               memberType === 'Treasurer' ? '#fef3c7' : '#f0fdf4',
  color: memberType === 'Admin' ? '#6366f1' :
         memberType === 'Treasurer' ? '#d97706' : '#16a34a'
});

export default GroupManagement;