import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Users2, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, FileText
} from 'lucide-react'; 
import React, { useState } from 'react';
import './TreasurerDashboard.css';
import Profile from '../components/Profile';

const TreasurerDashboard = ({ user = {}, onLogout = () => {} }) => {
  const navigate = useNavigate();
  
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleBackToDashboard = () => {
    setShowProfile(false);
  };

  if (showProfile) {
    return (
      <section className="dashboard-shell">
        <aside className="sidebar">
          <header className="sidebar-brand">
            <figure className="brand-identity">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="16" fill="#F5C842" />
                <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="22" r="2" fill="#1A3A6B"/>
              </svg>
              <figcaption className="brand-text">StokvelStokkie</figcaption>
            </figure>
          </header>
          <hr className="sidebar-divider" />
          <button className="back-to-dashboard" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </aside>
        <main className="main-content">
          <Profile user={user} onLogout={onLogout} />
        </main>
      </section>
    );
  }

  return (
    <section className="dashboard-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="22" r="2" fill="#1A3A6B"/>
            </svg>
            <figcaption className="brand-text">StokvelStokkie</figcaption>
          </figure>
        </header>

        <hr className="sidebar-divider" />

        <nav className="sidebar-nav" aria-label="Treasurer Navigation">
          <ul className="nav-list">
            <li>
              <button 
                type="button"
                onClick={() => setActiveTab('dashboard')} 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={20} /> <label>Dashboard</label>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigate('/home')} 
                className="nav-item"
              >
                <Users size={20} /> <label>My Groups</label>
              </button>
            </li>
            
            <li>
              <button 
                type="button"
                onClick={() => setIsGroupsOpen(!isGroupsOpen)} 
                className="nav-item dropdown-trigger"
                aria-expanded={isGroupsOpen}
              >
                <Users2 size={20} /> <label>Contribution Tracking</label>
                <ChevronDown size={16} className={`chevron-icon ${isGroupsOpen ? "rotate" : ""}`} />
              </button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('view-members')} 
                      className={`submenu-btn ${activeTab === 'view-members' ? 'active-sub' : ''}`}
                    >
                      <Users size={16} /><label>View Contributions</label>
                    </button>
                  </li>
                  <li>
                    <button type="button" className="submenu-btn">
                      <UserPlus size={16} /><label>Payout Schedule</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>
            
            <li>
              <button 
                type="button"
                onClick={() => setIsMeetingsOpen(!isMeetingsOpen)} 
                className="nav-item dropdown-trigger"
                aria-expanded={isMeetingsOpen}
              >
                <CalendarDays size={20} /> <label>Meeting Management</label>
                <ChevronDown size={16} className={`chevron-icon ${isMeetingsOpen ? "rotate" : ""}`} />
              </button>
              {isMeetingsOpen && (
                <ul className="submenu">
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('schedule-meeting')} 
                      className={`submenu-btn ${activeTab === 'schedule-meeting' ? 'active-sub' : ''}`}
                    >
                      <CalendarDays size={16} /><label>Schedule Meeting</label>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('post-agenda')} 
                      className={`submenu-btn ${activeTab === 'post-agenda' ? 'active-sub' : ''}`}
                    >
                      <FileText size={16} /><label>Post Agenda</label>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('record-minutes')} 
                      className={`submenu-btn ${activeTab === 'record-minutes' ? 'active-sub' : ''}`}
                    >
                      <Mic2 size={16} /><label>Record Minutes</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <footer className="sidebar-footer">
          <hr className="sidebar-divider" />
          <nav aria-label="Account Actions">
            <ul className="footer-list">
              <li><button type="button" className="footer-item"><Bell size={20} /><label>Notifications</label></button></li>
              <li>
                <button 
                  type="button" 
                  className="footer-item" 
                  onClick={handleProfileClick}
                >
                  <UserCircle size={20} /><label>Profile</label>
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className="footer-item logout-btn" 
                  onClick={onLogout}
                >
                  <LogOut size={20} /><label>Logout</label>
                </button>
              </li>
            </ul>
          </nav>
        </footer>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Content implementation starts here */}
      </main>
    </section>
  );
};

export default TreasurerDashboard;
