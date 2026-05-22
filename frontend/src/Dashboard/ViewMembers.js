import React from 'react';
import './ViewMembers.css';

const ViewMembers = ({ group, members = [], onSelectMember }) => {
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

  const getRoleColor = (type) => {
    if (type === 'Admin') return { bg: '#eef2ff', color: '#6366f1' };
    if (type === 'Treasurer') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#f0fdf4', color: '#16a34a' };
  };

  return (
    <article className="vm-wrapper">

      {/* ── GROUP HEADER ── */}
      <header className="vm-group-header">
        <div className="vm-group-info">
          <h2 className="vm-group-name">
            {group?.groupName || 'Loading Group...'}
          </h2>
          {group?.creationDate && (
            <p className="vm-group-date">
              Created:{' '}
              {new Date(group.creationDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}
        </div>

        <div className="vm-member-count-badge">
          <span className="vm-count-number">{members.length}</span>
          <span className="vm-count-label">Member{members.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      {/* ── MEMBERS LIST ── */}
      <nav className="vm-list-nav">
        {members.length === 0 ? (
          <div className="vm-empty">
            <p className="vm-empty-icon">👥</p>
            <p className="vm-empty-text">No members found in this group.</p>
          </div>
        ) : (
          <ul className="vm-list">
            {members.map((member) => {
              const isMe =
                member.userEmail?.trim().toLowerCase() ===
                currentUser?.email?.trim().toLowerCase();

              const roleColors = getRoleColor(member.memberType);
              const hasRole = member.memberType === 'Admin' || member.memberType === 'Treasurer';
              const initial = (member.fullName || member.userEmail || '?')[0].toUpperCase();

              return (
                <li
                  key={member._id}
                  className="vm-member-row"
                  onClick={() => onSelectMember(member)}
                >
                  {/* Avatar */}
                  <div
                    className="vm-avatar"
                    style={{ background: roleColors.bg, color: roleColors.color }}
                  >
                    {initial}
                  </div>

                  {/* Name + Email */}
                  <div className="vm-member-info">
                    <p className="vm-member-name">
                      {isMe ? 'You' : member.fullName || 'No name set'}
                    </p>
                    <p className="vm-member-email">{member.userEmail}</p>
                  </div>

                  {/* Role badge */}
                  {hasRole && (
                    <span
                      className="vm-role-badge"
                      style={{ background: roleColors.bg, color: roleColors.color }}
                    >
                      {member.memberType}
                    </span>
                  )}

                  {/* Arrow */}
                  <span className="vm-arrow">›</span>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </article>
  );
};

export default ViewMembers;