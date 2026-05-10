import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Users2, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, FileText, ClipboardList, ChevronLeft, ChevronRight
} from 'lucide-react'; 

// Components
import Profile from '../components/Profile';
import ScheduleMeeting from './ScheduleMeeting';
import PostAgendas from './PostAgendas';
import RecordMinutes from './RecordMinutes';
import ViewContributions from './ViewContributions'; // 1. Import your new component

import './TreasurerDashboard.css';

const TreasurerDashboard = ({ user = {}, onLogout = () => {} }) => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  // State
  const [meetings, setMeetings] = useState([]);
  const [groupName, setGroupName] = useState('Group Dashboard'); 
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  const [today] = useState(new Date());

  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem('stokvel_groups') || '[]');
    const currentGroup = savedGroups.find(g => g._id === groupId);
    if (currentGroup?.groupName) {
      setGroupName(currentGroup.groupName);
    }

    const savedMeetings = JSON.parse(localStorage.getItem('stokvel_meetings') || '[]');
    const now = new Date();

    const currentGroupMeetings = savedMeetings.filter(m => {
      const meetingEnd = new Date(`${m.meetingDate}T${m.endTime}`);
      return m.groupId === groupId && meetingEnd > now;
    });

    setMeetings(currentGroupMeetings);
  }, [groupId, activeTab]);

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

  const changeMonth = (offset) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
  };

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
                <li key={index} className="timeline-item" style={{ 
                  padding: '15px', borderLeft: '4px solid #2563eb', 
                  background: '#f8fafc', marginBottom: '10px', borderRadius: '0 8px 8px 0' 
                }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{meeting.meetingTitle}</strong>
                  <time style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    📅 {meeting.meetingDate} | 🕒 {meeting.startTime} - {meeting.endTime}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <figure className="empty-state">
              <ClipboardList size={80} strokeWidth={1} className="empty-icon" />
              <figcaption>No scheduled meetings for {groupName}</figcaption>
            </figure>
          )}
        </article>
      </section>

      <section className="calendar-section">
        <article className="content-card">
          <header className="calendar-card-header">
            <h2>Calendar</h2>
            <button type="button" className="new-event-btn">New event</button>
          </header>
          <nav className="calendar-nav">
            <button onClick={() => changeMonth(-1)} className="month-nav-btn">
              <ChevronLeft size={18} /> {monthNames[(currentMonth - 1 + 12) % 12]}
            </button>
            <h3 className="calendar-current-date">{monthNames[currentMonth]} {currentYear}</h3>
            <button onClick={() => changeMonth(1)} className="month-nav-btn">
              {monthNames[(currentMonth + 1) % 12]} <ChevronRight size={18} />
            </button>
          </nav>
          <ul className="calendar-grid">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(dayName => (
              <li key={dayName} className="weekday-label">{dayName}</li>
            ))}
            {blanks.map((_, i) => <li key={`blank-${i}`} className="calendar-day empty"></li>)}
            {days.map(day => {
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
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
    if (showProfile) return <Profile user={user} onLogout={onLogout} />;
    
    switch (activeTab) {
      case 'schedule-meeting': return <ScheduleMeeting />;
      case 'post-agenda': return <PostAgendas />;
      case 'record-minutes': return <RecordMinutes />;
      case 'view-contributions': return <ViewContributions />; // 2. Add this case
      case 'dashboard':
      default: return renderDashboardHome();
    }
  };

  return (
    <section className="treasurer-theme dashboard-shell">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="logo-svg">
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="22" r="2" fill="#1A3A6B"/>
            </svg>
            <figcaption className="brand-text">StokvelStokkie</figcaption>
          </figure>
        </header>

        <hr className="sidebar-divider" />

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li>
              <button onClick={() => { setActiveTab('dashboard'); setShowProfile(false); }} className={`nav-item ${activeTab === 'dashboard' && !showProfile ? 'active' : ''}`}>
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
                <Users2 size={20} /> <label>Contribution Tracking</label>
                <ChevronDown size={16} className={isGroupsOpen ? "rotate" : ""} />
              </button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li>
                    {/* 3. Added onClick to switch to view-contributions */}
                    <button 
                      className={`submenu-btn ${activeTab === 'view-contributions' ? 'active' : ''}`}
                      onClick={() => { setActiveTab('view-contributions'); setShowProfile(false); }}
                    >
                      <Users size={16} /><label>View Contributions</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button onClick={() => setIsMeetingsOpen(!isMeetingsOpen)} className="nav-item dropdown-trigger">
                <CalendarDays size={20} /> <label>Meeting Management</label>
                <ChevronDown size={16} className={isMeetingsOpen ? "rotate" : ""} />
              </button>
              {isMeetingsOpen && (
                <ul className="submenu">
                  <li>
                    <button onClick={() => {setActiveTab('schedule-meeting'); setShowProfile(false);}} className="submenu-btn">
                      <CalendarDays size={16} /><label>Schedule Meeting</label>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => {setActiveTab('post-agenda'); setShowProfile(false);}} className="submenu-btn">
                      <FileText size={16} /><label>Post Agenda</label>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => {setActiveTab('record-minutes'); setShowProfile(false);}} className="submenu-btn">
                      <Mic2 size={16} /><label>Record Minutes</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <footer className="sidebar-footer">
          <hr className="footer-divider" />
          <ul className="footer-list">
            <li><button className="footer-item"><Bell size={20} /><label>Notifications</label></button></li>
            <li>
              <button className="footer-item" onClick={() => setShowProfile(true)}>
                <UserCircle size={20} /><label>Profile</label>
              </button>
            </li>
            <li>
              <button className="footer-item logout-btn" onClick={onLogout}>
                <LogOut size={20} /><label>Logout</label>
              </button>
            </li>
          </ul>
        </footer>
      </aside>

      <main className="main-content">
        {(showProfile || activeTab !== 'dashboard') && (
           <button 
             className="back-to-dashboard" 
             onClick={() => { setShowProfile(false); setActiveTab('dashboard'); }} 
             style={{marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold'}}
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