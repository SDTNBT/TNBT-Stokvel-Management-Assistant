import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Users2, 
  CalendarDays, ClipboardList, Mic2, 
  ChevronDown, UserCircle, LogOut,
  ChevronLeft, ChevronRight, Bell, FileText
} from 'lucide-react'; 

import { useGroupData } from './useGroupData';
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
  const [viewDate, setViewDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState(null);

  const { members, group, setMembers } = useGroupData(groupId);
  const { users, loading: usersLoading } = useAllUsers();

  // Handle Group Name and Meetings Init
  useEffect(() => {
    let foundName = location.state?.groupName || "";

    if (!foundName) {
      const storageKeys = ['stokvel_groups', 'groups', 'user_groups'];
      for (const key of storageKeys) {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const match = data.find(g => String(g._id) === String(groupId) || String(g.id) === String(groupId));
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

  // Calendar Logic
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
    setSelectedMember(null);
  };

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
    } catch (err) { console.error(err); }
    return false;
  };

  const handleSelectMember = async (targetUser) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipient: targetUser.email,
        type: 'invite',
        title: 'Group Invite',
        message: `You've been invited to join ${group.groupName}.`,
        groupId: group._id,
      }),
    });
    alert(`Invite sent to ${targetUser.email}`);
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
            <header className="content-header">
              <h1 className="dashboard-title">Dashboard</h1>
              <div className="group-badge">{groupName}</div>
            </header>
            
            <section className="timeline-section">
              <article className="content-card">
                <h2>Timeline</h2>
                <hr className="card-divider" />
                {meetings.length > 0 ? (
                  <ul className="timeline-list">
                    {meetings.map((meeting, index) => (
                      <li key={index} className="timeline-item">
                        <strong>{meeting.meetingTitle}</strong>
                        <time>📅 {meeting.meetingDate} | 🕒 {meeting.startTime} - {meeting.endTime}</time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">
                    <ClipboardList size={80} strokeWidth={1} />
                    <p>No scheduled meetings for {groupName}</p>
                  </div>
                )}
              </article>
            </section>

            <section className="calendar-section">
              <article className="content-card">
                <header className="calendar-card-header">
                  <h2>Calendar</h2>
                </header>
                <nav className="calendar-nav">
                  <button onClick={() => changeMonth(-1)}><ChevronLeft size={18} /> {monthNames[(currentMonth - 1 + 12) % 12]}</button>
                  <h3>{monthNames[currentMonth]} {currentYear}</h3>
                  <button onClick={() => changeMonth(1)}>{monthNames[(currentMonth + 1) % 12]} <ChevronRight size={18} /></button>
                </nav>
                <ul className="calendar-grid">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <li key={d} className="weekday-label">{d}</li>)}
                  {blanks.map((_, i) => <li key={`b-${i}`} className="calendar-day empty"></li>)}
                  {days.map(day => (
                    <li key={day} className={`calendar-day ${day === today.getDate() && currentMonth === today.getMonth() ? 'today' : ''}`}>{day}</li>
                  ))}
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
        <div className="sidebar-brand">
          <div className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F5C842" /></svg>
            <span className="brand-text">StokvelStokkie</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li><button onClick={() => handleTabChange('dashboard')} className="nav-item"><LayoutDashboard size={20} /> Dashboard</button></li>
            <li><button onClick={() => navigate('/home')} className="nav-item"><Users size={20} /> My Groups</button></li>
            <li>
              <button onClick={() => setIsGroupsOpen(!isGroupsOpen)} className="nav-item dropdown-trigger"><Users2 size={20} /> Group Mgmt <ChevronDown size={16} /></button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li><button onClick={() => handleTabChange('view-members')}><Users size={16} /> View Members</button></li>
                  <li><button onClick={() => handleTabChange('invite-member')}><UserPlus size={16} /> Invite Member</button></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
        <footer className="sidebar-footer">
            <button onClick={() => setShowProfile(true)} className="footer-item"><UserCircle size={20} /> Profile</button>
            <button onClick={onLogout} className="footer-item logout-btn"><LogOut size={20} /> Logout</button>
        </footer>
      </aside>
      <main className="main-content">{renderContent()}</main>
    </section>
  );
};

export default NewAdminDashboard;