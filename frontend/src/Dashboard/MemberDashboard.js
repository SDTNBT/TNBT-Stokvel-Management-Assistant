import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Users2, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, FileText
} from 'lucide-react'; 
import React, { useState } from 'react';
import './MemberDashboard.css';
import Profile from '../components/Profile';

const MemberDashboard = ({ user = {}, onLogout = () => {} }) => {
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
      <div className="dashboard-shell">
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
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {/* Sidebar Navigation */}
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

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            <li>
              <button 
                type="button"
                onClick={() => setActiveTab('dashboard')} 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={20} /> <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigate('/home')} 
                className="nav-item"
              >
                <Users size={20} /> <span>My Groups</span>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigate('/contributions')} 
                className="nav-item"
              >
                <Users size={20} /> <span>View My Contributions</span>
              </button>
            </li>
            
            {/* Meeting Management Section */}
            <li>
              <button 
                type="button"
                onClick={() => setIsMeetingsOpen(!isMeetingsOpen)} 
                className="nav-item dropdown-trigger"
                aria-expanded={isMeetingsOpen}
              >
                <CalendarDays size={20} /> <span>My Reports</span>
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
                      <CalendarDays size={16} /><span>Schedule Meeting</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('post-agenda')} 
                      className={`submenu-btn ${activeTab === 'post-agenda' ? 'active-sub' : ''}`}
                    >
                      <FileText size={16} /><span>Post Agenda</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('record-minutes')} 
                      className={`submenu-btn ${activeTab === 'record-minutes' ? 'active-sub' : ''}`}
                    >
                      <Mic2 size={16} /><span>Record Minutes</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <footer className="sidebar-footer">
          <hr className="sidebar-divider" />
          <nav aria-label="User Actions">
            <ul className="footer-list">
              <li><button type="button" className="footer-item"><Bell size={20} /><span>Notifications</span></button></li>
              <li>
                <button 
                  type="button" 
                  className="footer-item" 
                  onClick={handleProfileClick}
                >
                  <UserCircle size={20} /><span>Profile</span>
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className="footer-item logout-btn" 
                  onClick={onLogout}
                >
                  <LogOut size={20} /><span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </footer>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
           <h1 className="dashboard-title">
             {activeTab.replace('-', ' ')}
           </h1>
        </header>

        <section className="content-body">
          {/* Your member content will be rendered here */}
        </section>
      </main>
    </div>
  );
};

export default MemberDashboard;
