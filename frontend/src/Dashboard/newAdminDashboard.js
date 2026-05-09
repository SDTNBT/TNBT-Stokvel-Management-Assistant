import { useNavigate ,useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Users2, 
  CalendarDays, ClipboardList, Mic2, 
  ChevronDown, UserCircle, LogOut,
  ChevronLeft, ChevronRight, Bell, FileText
} from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import { useGroupData } from './useGroupData';
import './newAdminDashboard.css';

// --- CRITICAL: Match these imports to your filenames exactly ---
import ScheduleMeeting from './ScheduleMeeting';
import PostAgendas from './PostAgendas';
import RecordMinutes from './RecordMinutes';
import ViewMembers from './ViewMembers';
import MemberDetails from './MemberDetails';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- CALENDAR LOGIC ---
  const [viewDate, setViewDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const { members, group, setMembers } = useGroupData(groupId);
  const [selectedMember, setSelectedMember] = useState(null);
  
  useEffect(() => {
    setToday(new Date());
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  // FIXED: Logic to generate the correct number of days and blank spaces
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Monday start adjustment (0=Sun, 1=Mon... 6=Sat)
  // If first day is Sunday(0), we need 6 blanks. If Monday(1), 0 blanks.
  const shift = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const blanks = Array.from({ length: shift });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const changeMonth = (offset) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
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
      return false;
    } catch (err) {
      return false;
    }
  };


  const renderContent = () => {

    if (selectedMember) {
      return (
        <MemberDetails 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          onRemove={handleRemove} 
        />
      );
    }
    
    if (activeTab === 'schedule-meeting') return <ScheduleMeeting />;
    if (activeTab === 'post-agenda') return <PostAgendas />;
    if (activeTab === 'record-minutes') return <RecordMinutes />;
    if (activeTab === 'view-members') {
      // Pass the data down from the hook
      return <ViewMembers group={group} members={members} onSelectMember={setSelectedMember} />;
    }
    
    return (
      <>
        <header className="content-header">
          <h1 className="dashboard-title">My Dashboard</h1>
        </header>
        <section className="timeline-section">
          <article className="content-card">
            <h2>Timeline</h2>
            <hr className="card-divider" />
            <figure className="empty-state">
              <picture className="empty-icon"><ClipboardList size={80} strokeWidth={1} /></picture>
              <figcaption>No scheduled meetings</figcaption>
            </figure>
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
                <ChevronLeft size={18} /> <label>{monthNames[(currentMonth - 1 + 12) % 12]}</label>
              </button>
              <h3 className="calendar-current-date">{monthNames[currentMonth]} {currentYear}</h3>
              <button onClick={() => changeMonth(1)} className="month-nav-btn">
                <label>{monthNames[(currentMonth + 1) % 12]}</label> <ChevronRight size={18} />
              </button>
            </nav>
            <ul className="calendar-grid">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(dayName => (
                <li key={dayName} className="weekday-label">{dayName}</li>
              ))}
              
              {/* FIXED: Rendering blanks properly */}
              {blanks.map((_, i) => (
                <li key={`blank-${i}`} className="calendar-day empty"></li>
              ))}

              {/* FIXED: Rendering days with strict today check */}
              {days.map(day => {
                const isToday = 
                  day === today.getDate() && 
                  currentMonth === today.getMonth() && 
                  currentYear === today.getFullYear();

                return (
                  <li 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                  >
                    {day}
                  </li>
                );
              })}
            </ul>
          </article>
        </section>
      </>
    );
  };

  return (
    <section className="dashboard-shell">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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
              <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> <p>Dashboard</p>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/home')} className="nav-item">
                <Users size={20} /> <p>My Groups</p>
              </button>
            </li>
            <li>
              <button onClick={() => setIsGroupsOpen(!isGroupsOpen)} className="nav-item dropdown-trigger">
                <Users2 size={20} /> <p>Group Management</p>
                <ChevronDown size={16} className={`chevron-icon ${isGroupsOpen ? "rotate" : ""}`} />
              </button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li>
                    <button onClick={() => setActiveTab('view-members')} className={`submenu-btn ${activeTab === 'view-members' ? 'active-sub' : ''}`}>
                      <Users size={16} /><p>View Member</p>
                    </button>
                  </li>
                  <li><button className="submenu-btn"><UserPlus size={16} /><p>Add Member</p></button></li>
                </ul>
              )}
            </li>
            
            <li>
              <button onClick={() => setIsMeetingsOpen(!isMeetingsOpen)} className="nav-item dropdown-trigger">
                <CalendarDays size={20} /> <p>Meeting Management</p>
                <ChevronDown size={16} className={`chevron-icon ${isMeetingsOpen ? "rotate" : ""}`} />
              </button>
              {isMeetingsOpen && (
                <ul className="submenu">
                  <li>
                    <button onClick={() => setActiveTab('schedule-meeting')} className={`submenu-btn ${activeTab === 'schedule-meeting' ? 'active-sub' : ''}`}>
                      <CalendarDays size={16} /><p>Schedule Meeting</p>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('post-agenda')} className={`submenu-btn ${activeTab === 'post-agenda' ? 'active-sub' : ''}`}>
                      <FileText size={16} /><p>Post Agenda</p>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('record-minutes')} className={`submenu-btn ${activeTab === 'record-minutes' ? 'active-sub' : ''}`}>
                      <Mic2 size={16} /><p>Record Minutes</p>
                    </button>
                  </li>
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
              <li><button className="footer-item"><UserCircle size={20} /><p>Profile</p></button></li>
              <li><button className="footer-item logout-btn"><LogOut size={20} /><p>Logout</p></button></li>
            </ul>
          </nav>
        </footer>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
    </section>
  );
};

export default AdminDashboard;