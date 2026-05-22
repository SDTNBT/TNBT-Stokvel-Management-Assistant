import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, TrendingUp,
  FileText, ClipboardList, ChevronLeft, ChevronRight, CheckSquare
} from 'lucide-react'; 

// Components
import Profile from '../components/Profile';
import ScheduleMeeting from './ScheduleMeeting';
import PostAgendas from './PostAgendas';
import RecordMinutes from './RecordMinutes';
import SchedulePayout from '../components/SchedulePayout';
import PaymentTracking from './PaymentTracking';
import { InitiatePayout } from './InitiatePayout';
import './TreasurerDashboard.css';

const TreasurerDashboard = ({ onLogout = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const groupName = location.state?.groupName || 'Group Dashboard';
  const groupId = location.state?.groupId || '';
  const sessionUser = location.state?.user || JSON.parse(sessionStorage.getItem('user') || '{}');

  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [isFinancesOpen, setIsFinancesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [today] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (groupId) {
        const savedMeetings = JSON.parse(localStorage.getItem('stokvel_meetings') || '[]');
        const currentGroupMeetings = savedMeetings.filter(m => m.groupId === groupId);
        setMeetings(currentGroupMeetings);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${apiUrl}/managegroup/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const groupMembers = Array.isArray(data) ? data : (data.members || []);
            setMembers(groupMembers);
          }
        } catch (err) {
          console.error('Error fetching group members:', err);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [groupId]);

  // Calendar helpers
  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
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

  // ── Dashboard Home ──
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
            <button onClick={() => changeMonth(-1)} className="month-nav-btn">
              <ChevronLeft size={18} />
            </button>
            <h3 className="calendar-current-date">{monthNames[currentMonth]} {currentYear}</h3>
            <button onClick={() => changeMonth(1)} className="month-nav-btn">
              <ChevronRight size={18} />
            </button>
          </nav>
          <ul className="calendar-grid">
            {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
              <li key={d} className="weekday-label">{d}</li>
            ))}
            {blanks.map((_, i) => <li key={`blank-${i}`} className="calendar-day empty" />)}
            {days.map(day => {
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              return (
                <li key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                  {day}
                </li>
              );
            })}
          </ul>
        </article>
      </section>
    </>
  );

  const renderMainContent = () => {
    if (showProfile) return <Profile user={sessionUser} onLogout={onLogout} />;
    
    switch (activeTab) {
      case 'schedule-meeting':   return <ScheduleMeeting />;
      case 'post-agenda':        return <PostAgendas />;
      case 'record-minutes':     return <RecordMinutes />;
      case 'payment-tracking':   return <PaymentTracking groupId={groupId} />;
      case 'schedule-payout':    return <SchedulePayout />;
      case 'initiate-payout':    return <InitiatePayout members={members} groupId={groupId} groupName={groupName} />;
      case 'dashboard':
      default:                   return renderDashboardHome();
    }
  };

  if (loading) {
    return (
      <section className="dashboard-shell treasurer-theme">
        <main className="main-content">
          <div className="loading-spinner">Loading treasurer dashboard...</div>
        </main>
      </section>
    );
  }

  return (
    <section className="dashboard-shell treasurer-theme">
      <aside className="sidebar">

        {/* Brand */}
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="22" r="2" fill="#1A3A6B" />
            </svg>
            <figcaption className="brand-text">StokvelStokkie</figcaption>
          </figure>
        </header>

        <hr className="sidebar-divider" />

        {/* Nav */}
        <nav className="sidebar-nav">
          <ul className="nav-list">

            <li>
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`nav-item ${activeTab === 'dashboard' && !showProfile ? 'active' : ''}`}
              >
                <LayoutDashboard size={20} />
                <label>Dashboard</label>
              </button>
            </li>

            <li>
              <button onClick={() => navigate('/home')} className="nav-item">
                <Users size={20} />
                <label>My Groups</label>
              </button>
            </li>

            {/* Tracking dropdown */}
            <li>
              <button
                onClick={() => setIsGroupsOpen(!isGroupsOpen)}
                className="nav-item dropdown-trigger"
              >
                <TrendingUp size={20} />
                <label>Tracking</label>
                <ChevronDown size={16} className={`chevron-icon ${isGroupsOpen ? 'rotate' : ''}`} />
              </button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li>
                    <button
                      onClick={() => handleTabChange('payment-tracking')}
                      className={`submenu-btn ${activeTab === 'payment-tracking' ? 'active-sub' : ''}`}
                    >
                      <CheckSquare size={16} />
                      <label>Payment Tracking</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* Finances dropdown */}
            <li>
              <button
                onClick={() => setIsFinancesOpen(!isFinancesOpen)}
                className="nav-item dropdown-trigger"
              >
                <CreditCard size={20} />
                <label>Finances</label>
                <ChevronDown size={16} className={`chevron-icon ${isFinancesOpen ? 'rotate' : ''}`} />
              </button>
              {isFinancesOpen && (
                <ul className="submenu">
                  <li>
                    <button
                      onClick={() => handleTabChange('schedule-payout')}
                      className={`submenu-btn ${activeTab === 'schedule-payout' ? 'active-sub' : ''}`}
                    >
                      <CreditCard size={16} />
                      <label>Schedule Payout</label>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('initiate-payout')}
                      className={`submenu-btn ${activeTab === 'initiate-payout' ? 'active-sub' : ''}`}
                    >
                      <label>💸 Initiate Payout</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* Meetings dropdown */}
            <li>
              <button
                onClick={() => setIsMeetingsOpen(!isMeetingsOpen)}
                className="nav-item dropdown-trigger"
              >
                <CalendarDays size={20} />
                <label>Meetings</label>
                <ChevronDown size={16} className={`chevron-icon ${isMeetingsOpen ? 'rotate' : ''}`} />
              </button>
              {isMeetingsOpen && (
                <ul className="submenu">
                  <li>
                    <button
                      onClick={() => handleTabChange('schedule-meeting')}
                      className={`submenu-btn ${activeTab === 'schedule-meeting' ? 'active-sub' : ''}`}
                    >
                      <CalendarDays size={16} />
                      <label>Schedule</label>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('post-agenda')}
                      className={`submenu-btn ${activeTab === 'post-agenda' ? 'active-sub' : ''}`}
                    >
                      <FileText size={16} />
                      <label>Agenda</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>

          </ul>
        </nav>

        {/* Footer */}
        <footer className="sidebar-footer">
          <button
            className="footer-item"
            onClick={() => navigate('/notifications')}
          >
            <Bell size={20} />
            <label>Notifications</label>
          </button>
          <button
            className={`footer-item ${showProfile ? 'active' : ''}`}
            onClick={() => setShowProfile(true)}
          >
            <UserCircle size={20} />
            <label>Profile</label>
          </button>
          <button className="footer-item logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <label>Logout</label>
          </button>
        </footer>

      </aside>

      {/* Main */}
      <main className="main-content">
        {(showProfile || activeTab !== 'dashboard') && (
          <button
            className="back-to-dashboard-btn"
            onClick={() => handleTabChange('dashboard')}
          >
            ← Back to Dashboard
          </button>
        )}
        {renderMainContent()}
      </main>
    </section>
  );
};

export default TreasurerDashboard;