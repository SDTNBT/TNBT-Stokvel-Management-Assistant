import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  CalendarDays, Mic2, ChevronDown, UserCircle, 
  LogOut, Bell, TrendingUp, Clock, AlertCircle
} from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import './TreasurerDashboard.css';
import Profile from '../components/Profile';
import PaymentHistory from '../components/PaymentHistory';

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
                <TrendingUp size={20} /> <label>Contribution Tracking</label>
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
                      <Mic2 size={16} /><label>Post Agenda</label>
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
        </footer>
      </aside>

      <main className="main-content">
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
              <h3>Payout Schedule</h3>
              <p>View and manage payout schedules feature coming soon.</p>
            </section>
          )}
        </section>
      </main>
    </section>
  );
};

export default TreasurerDashboard;
