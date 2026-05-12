import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Users2, 
  CalendarDays, ClipboardList, Mic2, 
  ChevronDown, UserCircle, LogOut,
  ChevronLeft, ChevronRight, Bell, FileText
} from 'lucide-react'; 
import { useGroupData } from './useGroupData';
import './newAdminDashboard.css';
import { useAllUsers } from '../hooks/useAllUsers';
import Profile from '../components/Profile'; 
import './newAdminDashboard.css';

// Components
import ScheduleMeeting from './ScheduleMeeting';
import PostAgendas from './PostAgendas';
import RecordMinutes from './RecordMinutes';
import ViewMembers from './ViewMembers';
import MemberDetails from './MemberDetails';
import { InviteMember } from './InviteMember';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NewAdminDashboard = ({ user = {}, onLogout = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();
  
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  const [meetings, setMeetings] = useState([]);
  const [groupName, setGroupName] = useState(''); 

  useEffect(() => {
    let foundName = "";
    if (location.state?.groupName) {
      foundName = location.state.groupName;
    }

    if (!foundName) {
      const storageKeys = ['stokvel_groups', 'groups', 'user_groups'];
      for (const key of storageKeys) {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const match = data.find(g => 
          String(g._id) === String(groupId) || 
          String(g.id) === String(groupId)
        );
        if (match) {
          foundName = match.groupName || match.name;
          break; 
        }
      }
    }

    setGroupName(foundName || "Group Dashboard");

    const savedMeetings = JSON.parse(localStorage.getItem('stokvel_meetings') || '[]');
    const now = new Date();
    const currentGroupMeetings = savedMeetings.filter(m => {
      const meetingEnd = new Date(`${m.meetingDate}T${m.endTime}`);
      return String(m.groupId) === String(groupId) && meetingEnd > now;
    });
    setMeetings(currentGroupMeetings);
  }, [groupId, location.state]);

  const [viewDate, setViewDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const { members, group, setMembers } = useGroupData(groupId);
  const [selectedMember, setSelectedMember] = useState(null);
  const { users, loading: usersLoading } = useAllUsers();
  console.log("What is useAllUsers returning?", users);
  
  useEffect(() => { setToday(new Date()); }, []);

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

  const handleRemove = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/managegroup/${groupId}/member/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setMembers(prev => prev.filter(m => m._id !== memberId));
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  // In whatever parent component calls onSelectMember
  const handleSelectMember = async (user) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipient: user.email,        // ← must be 'recipient' to match the schema
        type:      'invite',
        title:     'Group Invite',
        message:   `You've been invited to join ${group.groupName}.`,
        groupId:   group._id,
      }),
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowProfile(false);
    setSelectedMember(null);
  };

  const renderContent = () => {
    if (showProfile) return <Profile user={user} onLogout={onLogout} />;
    if (selectedMember) return <MemberDetails member={selectedMember} onClose={() => setSelectedMember(null)} onRemove={handleRemove} />;
    
    switch (activeTab) {
      case 'schedule-meeting': return <ScheduleMeeting />;
      case 'post-agenda': return <PostAgendas />;
      case 'record-minutes': return <RecordMinutes />;
      case 'view-members': return <ViewMembers group={group} members={members} onSelectMember={setSelectedMember} />;
      case 'invite-member': return <InviteMember users={usersLoading ? [] : users} members={members} onSelectMember={handleSelectMember} />;
      case 'dashboard':
      default:
        return (
          <>
            <header className="content-header" style={{ display: 'block', paddingBottom: '20px' }}>
              <h1 className="dashboard-title" style={{ marginBottom: '5px' }}>Dashboard</h1>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700', 
                color: '#4f46e5',
                background: '#eef2ff',
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '8px'
              }}>
                {groupName}
              </div>
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
                        <time style={{ fontSize: '0.9rem', color: '#64748b' }}>📅 {meeting.meetingDate} | 🕒 {meeting.startTime} - {meeting.endTime}</time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <figure className="empty-state">
                    <picture className="empty-icon"><ClipboardList size={80} strokeWidth={1} /></picture>
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
                  <button onClick={() => changeMonth(-1)} className="month-nav-btn"><ChevronLeft size={18} /> <label>{monthNames[(currentMonth - 1 + 12) % 12]}</label></button>
                  <h3 className="calendar-current-date">{monthNames[currentMonth]} {currentYear}</h3>
                  <button onClick={() => changeMonth(1)} className="month-nav-btn"><label>{monthNames[(currentMonth + 1) % 12]}</label> <ChevronRight size={18} /></button>
                </nav>
                <ul className="calendar-grid">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(dayName => <li key={dayName} className="weekday-label">{dayName}</li>)}
                  {blanks.map((_, i) => <li key={`blank-${i}`} className="calendar-day empty"></li>)}
                  {days.map(day => {
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                    return <li key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>{day}</li>;
                  })}
                </ul>
              </article>
            </section>
          </>
        );
    }
  };

  return (
    <section className="dashboard-shell">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#F5C842" /><path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="16" cy="22" r="2" fill="#1A3A6B"/>
            </svg>
            <figcaption className="brand-text">StokvelStokkie</figcaption>
          </figure>
        </header>
        <hr className="sidebar-divider" />
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li><button onClick={() => handleTabChange('dashboard')} className={`nav-item ${activeTab === 'dashboard' && !showProfile ? 'active' : ''}`}><LayoutDashboard size={20} /> <p>Dashboard</p></button></li>
            <li><button onClick={() => navigate('/home')} className="nav-item"><Users size={20} /> <p>My Groups</p></button></li>
            <li>
              <button onClick={() => setIsGroupsOpen(!isGroupsOpen)} className="nav-item dropdown-trigger"><Users2 size={20} /> <p>Group Management</p><ChevronDown size={16} className={`chevron-icon ${isGroupsOpen ? "rotate" : ""}`} /></button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li><button onClick={() => handleTabChange('view-members')} className={`submenu-btn ${activeTab === 'view-members' ? 'active-sub' : ''}`}><Users size={16} /><p>View Member</p></button></li>
                  <li><button className="submenu-btn"><UserPlus size={16} /><p>Add Member</p></button></li>
                  <li><button onClick={() => setActiveTab('invite-member')} className={`submenu-btn ${activeTab === 'invite-member' ? 'active-sub' : ''}`}><UserPlus size={16} /><p>Invite Member</p></button></li>
                </ul>
              )}
            </li>
            <li style={{ marginBottom: '20px' }}>
              <button onClick={() => setIsMeetingsOpen(!isMeetingsOpen)} className="nav-item dropdown-trigger"><CalendarDays size={20} /> <p>Meeting Management</p><ChevronDown size={16} className={`chevron-icon ${isMeetingsOpen ? "rotate" : ""}`} /></button>
              {isMeetingsOpen && (
                <ul className="submenu">
                  <li><button onClick={() => handleTabChange('schedule-meeting')} className={`submenu-btn ${activeTab === 'schedule-meeting' ? 'active-sub' : ''}`}><CalendarDays size={16} /><p>Schedule Meeting</p></button></li>
                  <li><button onClick={() => handleTabChange('post-agenda')} className={`submenu-btn ${activeTab === 'post-agenda' ? 'active-sub' : ''}`}><FileText size={16} /><p>Post Agenda</p></button></li>
                  <li><button onClick={() => handleTabChange('record-minutes')} className={`submenu-btn ${activeTab === 'record-minutes' ? 'active-sub' : ''}`}><Mic2 size={16} /><p>Record Minutes</p></button></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
        <footer className="sidebar-footer">
          <hr className="sidebar-divider" />
          <nav>
            <ul className="footer-list">
              <li><button className="footer-item"><Bell size={20} /><p>Notifications</p></button></li>
              <li><button className={`footer-item ${showProfile ? 'active' : ''}`} onClick={() => setShowProfile(true)}><UserCircle size={20} /><p>Profile</p></button></li>
              <li><button className="footer-item logout-btn" onClick={onLogout}><LogOut size={20} /><p>Logout</p></button></li>
            </ul>
          </nav>
        </footer>
      </aside>
      <main className="main-content">{renderContent()}</main>
    </section>
  );
};

export default NewAdminDashboard;