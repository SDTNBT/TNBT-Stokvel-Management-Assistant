import React, { useState, useMemo } from 'react';
import './InviteMember.css';

export const InviteMember = ({ users = [], members = [], onSelectMember }) => {

  const [confirmedId, setConfirmed] = useState(null);

  // Set of emails already in the group for quick lookup
  const existingEmails = useMemo(
    () => new Set(members.map((m) => m.userEmail?.trim().toLowerCase())),
    [members]
  );

  // Split users into two groups — invitable and already members
  const { available, alreadyMembers } = useMemo(() => ({
    available:      users.filter((u) => !existingEmails.has(u.email?.trim().toLowerCase())),
    alreadyMembers: users.filter((u) =>  existingEmails.has(u.email?.trim().toLowerCase())),
  }), [users, existingEmails]);

  const handleUserClick = (user) => {
    onSelectMember(user);
    setConfirmed(user.email);
  };

  const renderRow = (user, disabled = false) => {
    const justInvited = confirmedId === user.email;
    const isClickable = !disabled && !justInvited;
    const displayName = user.fullName || user.name || user.firstName || user.username;
    const initial     = (displayName || user.email || '?')[0].toUpperCase();

    return (
      <li
        key={user.email}
        className={[
          'im-row',
          disabled    ? 'im-row--disabled' : '',
          justInvited ? 'im-row--invited'  : '',
        ].join(' ').trim()}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-disabled={!isClickable}
        onClick={() => isClickable && handleUserClick(user)}
        onKeyDown={(e) => e.key === 'Enter' && isClickable && handleUserClick(user)}
      >
        <span className="im-avatar" aria-hidden="true">{initial}</span>

        <section className="im-row-info">
          <p className="im-row-name">{displayName || '—'}</p>
          <p className="im-row-email">{user.email}</p>
        </section>

        {disabled && (
          <span className="im-badge im-badge--member">Member</span>
        )}
        {justInvited && (
          <span className="im-badge im-badge--invited">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M2 5.5l3 3 4-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Invited
          </span>
        )}
        {isClickable && (
          <i className="im-arrow" aria-hidden="true">›</i>
        )}
      </li>
    );
  };

  return (
    <article className="im-layout">

      <header className="im-header">
        <h2 className="im-title">Invite Members</h2>
        <p className="im-sub">
          {users.length} user{users.length !== 1 ? 's' : ''} in the database.
          Tap a name to send them a group invite.
        </p>
      </header>

      <nav className="im-list-nav" aria-label="All users">

        {/* Invitable users */}
        {available.length > 0 && (
          <section className="im-group" aria-labelledby="im-available-heading">
            <h3 className="im-group-label" id="im-available-heading">
              Available to invite
              <span className="im-group-count">{available.length}</span>
            </h3>
            <ul className="im-list">
              {available.map((u) => renderRow(u, false))}
            </ul>
          </section>
        )}

        {/* Already in the group — greyed out */}
        {alreadyMembers.length > 0 && (
          <section className="im-group" aria-labelledby="im-existing-heading">
            <h3 className="im-group-label im-group-label--muted" id="im-existing-heading">
              Already in this group
              <span className="im-group-count im-group-count--muted">{alreadyMembers.length}</span>
            </h3>
            <ul className="im-list">
              {alreadyMembers.map((u) => renderRow(u, true))}
            </ul>
          </section>
        )}

        {users.length === 0 && (
          <p className="im-empty">No users found in the database.</p>
        )}

      </nav>

    </article>
  );
};