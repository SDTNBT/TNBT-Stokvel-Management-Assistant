import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, TrendingUp, Clock, AlertCircle,
  FileText, ClipboardList, ChevronLeft, ChevronRight
} from 'lucide-react'; 

// Components
import Profile from '../components/Profile';
import ScheduleMeeting from './ScheduleMeeting';
import PostAgendas from './PostAgendas';
import RecordMinutes from './RecordMinutes';
import ViewContributions from './ViewContributions'; 

import './TreasurerDashboard.css';

const TreasurerDashboard = ({ onLogout = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation State
  const groupName = location.state?.groupName || "Group Dashboard";
  const groupId = location.state?.groupId || "";
  const sessionUser = location.state?.user || JSON.parse(sessionStorage.getItem('user') || '{}');

  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  // Data State
  const [meetings, setMeetings] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (groupId) {
      // Logic to load meetings from localStorage (similar to your previous working version)
      const savedMeetings = JSON.parse(localStorage.getItem('stokvel_meetings') || '[]');
      const currentGroupMeetings = savedMeetings.filter(m => m.groupId === groupId);
      setMeetings(currentGroupMeetings);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [groupId]);

  // Calendar Helpers
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const shift = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const blanks = Array.from({ length: shift });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const changeMonth = (offset) => setViewDate(new Date(currentYear, currentMonth + offset, 1));
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowProfile(false);
  };

  // Sub-Render: Dashboard Home (Timeline + Calendar)
  const renderDashboardHome = () => (
    <>
      <header className="content-header">
        <h1 className="dashboard-title">Dashboard: {groupName}</h1>
      </header>
      
      <section className="timeline-section">
        <article className="content-card">
          <header>
            <h2>Timeline</h2>
            <hr className="card-divider" />
          </header>
          {meetings.length > 0 ? (
            <ul className="timeline-list" style={{ listStyle: 'none', padding: 0 }}>
              {meetings.map((meeting, index) => (
                <li key={index} className="timeline-item">
                  <strong>{meeting.meetingTitle}</strong>
                  <time>📅 {meeting.meetingDate} | 🕒 {meeting.startTime}</time>
                </li>
              ))}
            </ul>
          ) : (
            <figure className="empty-state">
              <ClipboardList size={60} strokeWidth={1} className="empty-icon" />
              <figcaption>No scheduled meetings for {groupName}</figcaption>
            </figure>
          )}
        </article>
      </section>

      <section className="calendar-section">
        <article className="content-card">
          <header className="calendar-card-header">
            <h2>Calendar</h2>
          </header>
          <nav className="calendar-nav">
            <button onClick={() => changeMonth(-1)} className="month-nav-btn"><ChevronLeft size={18} /></button>
            <h3 className="calendar-current-date">{monthNames[currentMonth]} {currentYear}</h3>
            <button onClick={() => changeMonth(1)} className="month-nav-btn"><ChevronRight size={18} /></button>
          </nav>
          <ul className="calendar-grid">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <li key={d} className="weekday-label">{d}</li>)}
            {blanks.map((_, i) => <li key={`blank-${i}`} className="calendar-day empty"></li>)}
            {days.map(day => <li key={day} className="calendar-day">{day}</li>)}
          </ul>
        </article>
      </section>
    </>
  );

  const renderMainContent = () => {
    if (showProfile) return <Profile user={sessionUser} onLogout={onLogout} />;
    
    switch (activeTab) {
      case 'schedule-meeting': return <ScheduleMeeting />;
      case 'post-agenda': return <PostAgendas />;
      case 'record-minutes': return <RecordMinutes />;
      case 'view-contributions': return <ViewContributions />;
      case 'dashboard':
      default: return renderDashboardHome();
    }
  };

  if (loading) {
    return (
      <section className="dashboard-shell">
        <main className="main-content">
          <div className="loading-spinner">Loading treasurer dashboard...</div>
        </main>
      </section>
    );
  }

  return (
    <section className="dashboard-shell treasurer-theme">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" />
            </svg>
            <figcaption className="brand-text">StokvelStokkie</figcaption>
          </figure>
        </header>

        <hr className="sidebar-divider" />

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li>
              <button onClick={() => handleTabChange('dashboard')} className={`nav-item ${activeTab === 'dashboard' && !showProfile ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> <label>Dashboard</label>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/home')} className="nav-item">
                <Users size={20} /> <label>My Groups</label>
              </button>
            </li>
            
            <li>
              <button onClick={() => setIsGroupsOpen(!isGroupsOpen)} className="nav-item dropdown-trigger">
                <TrendingUp size={20} /> <label>Tracking</label>
                <ChevronDown size={16} className={isGroupsOpen ? "rotate" : ""} />
              </button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li>
                    <button onClick={() => handleTabChange('view-contributions')} className={`submenu-btn ${activeTab === 'view-contributions' ? 'active' : ''}`}>
                      <Users size={16} /><label>Contributions</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button onClick={() => setIsMeetingsOpen(!isMeetingsOpen)} className="nav-item dropdown-trigger">
                <CalendarDays size={20} /> <label>Meetings</label>
                <ChevronDown size={16} className={isMeetingsOpen ? "rotate" : ""} />
              </button>
              {isMeetingsOpen && (
                <ul className="submenu">
                  <li><button onClick={() => handleTabChange('schedule-meeting')} className="submenu-btn"><CalendarDays size={16} /><label>Schedule</label></button></li>
                  <li><button onClick={() => handleTabChange('post-agenda')} className="submenu-btn"><FileText size={16} /><label>Agenda</label></button></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <footer className="sidebar-footer">
          <button className="footer-item" onClick={() => setShowProfile(true)}><UserCircle size={20} /><label>Profile</label></button>
          <button className="footer-item logout-btn" onClick={onLogout}><LogOut size={20} /><label>Logout</label></button>
        </footer>
      </aside>

      <main className="main-content">
        {(showProfile || activeTab !== 'dashboard') && (
           <button className="back-to-dashboard-btn" onClick={() => handleTabChange('dashboard')}>
             ← Back to Dashboard
           </button>
        )}
        {renderMainContent()}
      </main>
    </section>
  );
};

export default TreasurerDashboard;