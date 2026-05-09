import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css';
import Profile from '../components/Profile';

const AdminDashboard = ({ user, onLogout }) => {
  const { groupId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  const goToGroupManagement = () => {
    navigate(`/manage-group/${groupId}`);
  };

  const goToMeetingManager = () => {
    navigate(`/meeting-manager/${groupId}`);
  };

  const handleProfileClick = () => {
    console.log('Profile button clicked'); // Debug line
    setIsOpen(false);
    setShowProfile(true);
  };

  const handleBackToDashboard = () => {
    setShowProfile(false);
  };

  // Show Profile component when showProfile is true
  if (showProfile) {
    return (
      <main className="dashboard-container">
        <header className="top-bar">
          <nav className="navigation-controls">
            <button
              type="button"
              className="back-btn"
              onClick={handleBackToDashboard}
              aria-label="Back to Dashboard"
            >
              <figure className="back-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </figure>
            </button>
          </nav>
          <section className="user-controls">
            <button className="btn-logout-header" onClick={onLogout}>Logout</button>
          </section>
        </header>
        <Profile user={user} onLogout={onLogout} />
      </main>
    );
  }

  // Show Dashboard when showProfile is false
  return (
    <main className="dashboard-container">
      <header className="top-bar">
        <nav className="navigation-controls">
          <button
            type="button"
            className="back-btn"
            onClick={handleBack}
            aria-label="Go to Home"
          >
            <figure className="back-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </figure>
          </button>
        </nav>

        <section className="user-controls">
          <figure className="notification-icon">
            <svg viewBox="0 0 24 24" fill="#ffa500" stroke="none">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </figure>

          <figure className="user-avatar">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#4a148c" stroke="#4caf50" strokeWidth="2" />
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#4caf50" />
            </svg>
          </figure>

          <section className="admin-trigger-area" onClick={() => setIsOpen(!isOpen)}>
            <p className="user-role">Admin</p>
            <figure className={`dropdown-arrow ${isOpen ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="#333">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </figure>

            {isOpen && (
              <nav className="dropdown-panel">
                <button type="button" className="menu-action" onClick={handleProfileClick}>
                  <figure className="menu-icon-box">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </figure>
                  Profile
                </button>
                <button type="button" className="menu-action">
                  <figure className="menu-icon-box">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                    </svg>
                  </figure>
                  Settings
                </button>
                <button type="button" className="menu-action logout-btn" onClick={onLogout}>
                  <figure className="menu-icon-box">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                  </figure>
                  Logout
                </button>
              </nav>
            )}
          </section>
        </section>
      </header>

      <section className="tiles-grid">
        <article
          className="management-card"
          onClick={goToGroupManagement}
          style={{ cursor: 'pointer' }}
        >
          <header className="card-header">
            <h2 className="card-title">Manage Group</h2>
          </header>
          <figure className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </figure>
        </article>

        <article
          className="management-card"
          onClick={goToMeetingManager}
          style={{ cursor: 'pointer' }}
        >
          <header className="card-header">
            <h2 className="card-title">Manage Meetings</h2>
          </header>
          <figure className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="12" cy="16" r="3" />
              <polyline points="12 14 12 16 13 17" />
            </svg>
          </figure>
        </article>
      </section>
    </main>
  );
};

export default AdminDashboard;
