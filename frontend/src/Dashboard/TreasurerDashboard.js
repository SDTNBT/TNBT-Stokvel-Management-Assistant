import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, TrendingUp, Clock, AlertCircle
} from 'lucide-react'; 
<<<<<<< HEAD

// Components
import Profile from '../components/Profile';
import ScheduleMeeting from './ScheduleMeeting';
import PostAgendas from './PostAgendas';
import RecordMinutes from './RecordMinutes';
import ViewContributions from './ViewContributions';

=======
import React, { useState, useEffect } from 'react';
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
import './TreasurerDashboard.css';
import Profile from '../components/Profile';
import PaymentHistory from '../components/PaymentHistory';
import SchedulePayout from '../components/SchedulePayout';

const TreasurerDashboard = ({ onLogout = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupName = location.state?.groupName || "";
  const groupId = location.state?.groupId || "";
  const sessionUser = location.state?.user || JSON.parse(sessionStorage.getItem('user'));

  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalFunds: 0,
    monthlyCollection: 0,
    pendingContributions: 0,
    totalMembers: 0,
    activeMembers: 0,
    recentTransactions: [],
    groupStats: {
      name: '',
      totalSavings: 0,
      monthlyTarget: 0,
      achievementRate: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchDashboardStats();
      fetchRecentTransactions();
    }
  }, [groupId]);

<<<<<<< HEAD
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

  const handleTabChange = (tab) => {
    setShowProfile(false);
    setActiveTab(tab);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setActiveTab('profile');
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
      case 'view-contributions': return <ViewContributions />;
      case 'dashboard':
      default: return renderDashboardHome();
=======
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/treasurer/stats/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(prev => ({
          ...prev,
          totalFunds: data.totalFunds || 0,
          monthlyCollection: data.monthlyCollection || 0,
          pendingContributions: data.pendingContributions || 0,
          totalMembers: data.totalMembers || 0,
          activeMembers: data.activeMembers || 0,
          groupStats: {
            name: data.groupStats?.name || groupName,
            totalSavings: data.groupStats?.totalSavings || 0,
            monthlyTarget: data.groupStats?.monthlyTarget || 0,
            achievementRate: data.groupStats?.achievementRate || 0
          }
        }));
      } else if (response.status === 404) {
        console.log('Stats endpoint not ready yet');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/treasurer/transactions/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(prev => ({
          ...prev,
          recentTransactions: data.transactions || []
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(prev => ({
          ...prev,
          totalMembers: data.members?.length || 0,
          activeMembers: data.members?.filter(m => m.isActive !== false).length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleProfileClick = () => setShowProfile(true);
  const handleBackToDashboard = () => setShowProfile(false);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'R0.00';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch(statusLower) {
      case 'completed': 
      case 'confirmed': 
        return 'completed';
      case 'pending': 
        return 'pending';
      default: 
        return 'pending';
    }
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
          <button type="button" className="back-to-dashboard" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </aside>
        <main className="main-content">
          <Profile user={sessionUser} onLogout={onLogout} />
        </main>
      </section>
    );
  }

  if (loading) {
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
        </aside>
        <main className="main-content">
          <div className="loading-spinner">Loading treasurer dashboard...</div>
        </main>
      </section>
    );
  }

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

        <nav className="sidebar-nav" aria-label="Treasurer Navigation">
          <ul className="nav-list">
            <li>
<<<<<<< HEAD
              <button onClick={() => handleTabChange('dashboard')} className={`nav-item ${activeTab === 'dashboard' && !showProfile ? 'active' : ''}`}>
=======
              <button 
                type="button"
                onClick={() => setActiveTab('dashboard')} 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
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
                <TrendingUp size={20} /> <label>Contribution Tracking</label>
                <ChevronDown size={16} className={`chevron-icon ${isGroupsOpen ? "rotate" : ""}`} />
              </button>
              {isGroupsOpen && (
                <ul className="submenu">
                  <li>
                    <button 
<<<<<<< HEAD
                      className={`submenu-btn ${activeTab === 'view-contributions' ? 'active' : ''}`}
                      onClick={() => handleTabChange('view-contributions')}
=======
                      type="button"
                      onClick={() => setActiveTab('view-members')} 
                      className={`submenu-btn ${activeTab === 'view-members' ? 'active-sub' : ''}`}
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
                    >
                      <Users size={16} /><label>View Contributions</label>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('payout-schedule')} 
                      className={`submenu-btn ${activeTab === 'payout-schedule' ? 'active-sub' : ''}`}
                    >
                      <Clock size={16} /><label>Payout Schedule</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button 
                type="button"
                onClick={() => setActiveTab('my-payments')} 
                className={`nav-item ${activeTab === 'my-payments' ? 'active' : ''}`}
              >
                <CreditCard size={20} /> <label>My Payments</label>
              </button>
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
<<<<<<< HEAD
                    <button onClick={() => handleTabChange('schedule-meeting')} className={`submenu-btn ${activeTab === 'schedule-meeting' ? 'active' : ''}`}>
=======
                    <button 
                      type="button"
                      onClick={() => setActiveTab('schedule-meeting')} 
                      className={`submenu-btn ${activeTab === 'schedule-meeting' ? 'active-sub' : ''}`}
                    >
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
                      <CalendarDays size={16} /><label>Schedule Meeting</label>
                    </button>
                  </li>
                  <li>
<<<<<<< HEAD
                    <button onClick={() => handleTabChange('post-agenda')} className={`submenu-btn ${activeTab === 'post-agenda' ? 'active' : ''}`}>
                      <FileText size={16} /><label>Post Agenda</label>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleTabChange('record-minutes')} className={`submenu-btn ${activeTab === 'record-minutes' ? 'active' : ''}`}>
=======
                    <button 
                      type="button"
                      onClick={() => setActiveTab('post-agenda')} 
                      className={`submenu-btn ${activeTab === 'post-agenda' ? 'active-sub' : ''}`}
                    >
                      <Mic2 size={16} /><label>Post Agenda</label>
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('record-minutes')} 
                      className={`submenu-btn ${activeTab === 'record-minutes' ? 'active-sub' : ''}`}
                    >
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
                      <Mic2 size={16} /><label>Record Minutes</label>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <footer className="sidebar-footer">
<<<<<<< HEAD
          <hr className="footer-divider" />
          <ul className="footer-list">
            <li><button className="footer-item"><Bell size={20} /><label>Notifications</label></button></li>
            <li>
              <button className={`footer-item ${showProfile ? 'active' : ''}`} onClick={handleProfileClick}>
                <UserCircle size={20} /><label>Profile</label>
              </button>
            </li>
            <li>
              <button className="footer-item logout-btn" onClick={onLogout}>
                <LogOut size={20} /><label>Logout</label>
              </button>
            </li>
          </ul>
=======
          <hr className="sidebar-divider" />
          <nav aria-label="Account Actions">
            <ul className="footer-list">
              <li>
                <button type="button" className="footer-item">
                  <Bell size={20} /><label>Notifications</label>
                </button>
              </li>
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
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
        </footer>
      </aside>

      <main className="main-content">
<<<<<<< HEAD
        {/* The "Back to Dashboard" button has been removed from here */}
        {renderMainContent()}
=======
        <header className="content-header">
          <h1 className="dashboard-title">
            {activeTab === 'dashboard' ? 'Treasurer Dashboard' : 
             activeTab === 'my-payments' ? 'My Payment History' : 
             activeTab === 'view-members' ? 'Member Contributions' :
             activeTab === 'payout-schedule' ? 'Payout Schedule' :
             activeTab.replace(/-/g, ' ')}
          </h1>
        </header>

        <section className="content-body">
          {activeTab === 'dashboard' && (
            <>
              <section className="welcome-hero">
                <h2>Welcome back, {sessionUser?.name || sessionUser?.firstName || 'Treasurer'}</h2>
                <p>You are managing the <strong>{groupName || dashboardStats.groupStats.name || 'your group'}</strong> group.</p>
              </section>

              <section className="stats-grid">
                <article className="stat-card">
                  <h3>Total Funds</h3>
                  <p className="stat-value">{formatCurrency(dashboardStats.totalFunds)}</p>
                </article>
                <article className="stat-card">
                  <h3>Monthly Collection</h3>
                  <p className="stat-value">{formatCurrency(dashboardStats.monthlyCollection)}</p>
                </article>
                <article className="stat-card warning">
                  <h3>Pending Contributions</h3>
                  <p className="stat-value warning">{formatCurrency(dashboardStats.pendingContributions)}</p>
                </article>
                <article className="stat-card">
                  <h3>Active Members</h3>
                  <p className="stat-value">{dashboardStats.activeMembers}/{dashboardStats.totalMembers}</p>
                </article>
              </section>

              <section className="group-summary">
                <h3>Group Summary</h3>
                <article className="summary-details">
                  <p><strong>Group:</strong> {dashboardStats.groupStats.name || groupName}</p>
                  <p><strong>Total Savings:</strong> {formatCurrency(dashboardStats.groupStats.totalSavings)}</p>
                  <p><strong>Monthly Target:</strong> {formatCurrency(dashboardStats.groupStats.monthlyTarget)}</p>
                  <div>
                    <p><strong>Achievement Rate:</strong> {dashboardStats.groupStats.achievementRate}%</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${dashboardStats.groupStats.achievementRate}%` }}>
                        {dashboardStats.groupStats.achievementRate > 30 ? `${dashboardStats.groupStats.achievementRate}%` : ''}
                      </div>
                    </div>
                  </div>
                </article>
              </section>

              <section className="recent-transactions">
                <h3>Recent Transactions</h3>
                {dashboardStats.recentTransactions.length === 0 ? (
                  <p className="no-data">No transactions found</p>
                ) : (
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardStats.recentTransactions.map((transaction, index) => (
                        <tr key={transaction._id || index}>
                          <td>{transaction.member || transaction.payerName}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>{formatDate(transaction.date)}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                              {transaction.status || 'Pending'}
                            </span>
                          </td>
                          <td>{transaction.paymentMethod || transaction.method || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}

          {activeTab === 'my-payments' && (
            <PaymentHistory 
              user={sessionUser} 
              groupName={groupName || dashboardStats.groupStats.name} 
              groupId={groupId} 
            />
          )}

          {activeTab === 'view-members' && (
            <section className="group-summary">
              <h3>Member Contributions</h3>
              <p>View and manage member contributions feature coming soon.</p>
            </section>
          )}

          {activeTab === 'payout-schedule' && (
            <section className="group-summary">
              <SchedulePayout /> 
            </section>
          )}
        </section>
>>>>>>> 6475c3739f06f2befc1e7549247d2f59fe24fbff
      </main>
    </section>
  );
};

export default TreasurerDashboard;
