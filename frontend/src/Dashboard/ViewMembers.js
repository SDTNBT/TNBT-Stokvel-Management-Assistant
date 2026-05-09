import React from 'react';
import './ViewMembers.css';

const ViewMembers = ({ group, members = [], onSelectMember }) => {
  
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

  return (
    <article className="view-members-layout">
      <header className="members-header">
        <h2 className="group-name-bold">
          {group?.groupName || "Loading Group..."}
        </h2>

      
        {group?.creationDate && (
          <p className="group-date">
            Created: {new Date(group.creationDate).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        )}

        <p className="member-count">
          <strong>{members.length || 0}</strong> Members
        </p>
      </header>

      <nav className="members-list-nav">
        <ul className="members-list">
          {members && members.length > 0 ? (
            members.map((member) => {
              // Compare normalized emails
              const isMe = member.userEmail?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase();
              const hasTag = member.memberType === 'Admin' || member.memberType === 'Treasurer';

              return (
                <li 
                  key={member._id} 
                  className="member-clickable-card" 
                  onClick={() => onSelectMember(member)}
                >
                  <section className="name-tag-row">
                    <p className="member-display-name">
                      {isMe ? "You" : member.fullName || member.userEmail}
                    </p>
                    
                    {hasTag && (
                      <strong className="role-tag-blue-inline">
                        {member.memberType}
                      </strong>
                    )}
                  </section>
                  <i className="arrow-indicator">›</i>
                </li>
              );
            })
          ) : (
            <p className="empty-state-msg">No members found in this group.</p>
          )}
        </ul>
      </nav>
    </article>
  );
};

export default ViewMembers;