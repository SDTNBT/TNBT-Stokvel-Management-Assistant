import React, { useState, useEffect , useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import { House, Search, CreditCard, Bell, User, ChevronDown, MoreVertical, Trash2, CheckCircle } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ProfileTable from './ProfileTable';
import BankingOptions from './BankingOptions';
import BankingDetails from './BankingDetails';
import ViewBankingDetails from './ViewBankingDetails';
import { useBanking } from './useBanking';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home'); 
  const [groups, setGroups] = useState([]); 
  const [openMenuId, setOpenMenuId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchType, setSearchType] = useState('groups');

  // Wallet State
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalPaid: 0,
    pendingPayments: 0,
    transactions: []
  });
  const [walletLoading, setWalletLoading] = useState(false);

  // Activity State
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));

  const fetchGroups = async () => {
    try {
      if (loggedInUser && loggedInUser.email) {
        const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';
        const response = await axios.get(`${apiUrl}/stokvel/user/${loggedInUser.email}`);
        
        localStorage.setItem('stokvel_groups', JSON.stringify(response.data));
        setGroups(response.data);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [loggedInUser?.email]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchGroups();
      setNewGroupName(location.state.newGroup || '');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Search Function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';
      
      if (searchType === 'groups') {
        const response = await axios.get(`${apiUrl}/stokvel/search?q=${searchQuery}`);
        setSearchResults(response.data || []);
      } else {
        const response = await axios.get(`${apiUrl}/users/search?q=${searchQuery}`);
        setSearchResults(response.data || []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Fetch Wallet Data
  const fetchWalletData = async () => {
    setWalletLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = loggedInUser?.email;
      
      if (!userEmail) return;
      
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments-summary/${userEmail}`);
      
      if (response.ok) {
        const data = await response.json();
        const summary = data.summary || {};
        
        setWalletData({
          balance: summary.totalPaid || 0,
          totalPaid: summary.totalPaid || 0,
          pendingPayments: 0,
          transactions: []
        });
      }
      
      // Fetch recent transactions
      const txResponse = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments/${userEmail}`);
      if (txResponse.ok) {
        const txData = await txResponse.json();
        setWalletData(prev => ({
          ...prev,
          transactions: txData.payments || []
        }));
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  // Fetch Activities
  const fetchActivities = async () => {
    setActivityLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = loggedInUser?.email;
      
      if (!userEmail) return;
      
      // Combine different activities: groups joined, payments made, meetings scheduled
      const groupsResponse = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/stokvel/user/${userEmail}`);
      const paymentsResponse = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/payments/my-payments/${userEmail}`);
      
      const activitiesList = [];
      
      // Add group activities
      if (groupsResponse.ok) {
        const userGroups = await groupsResponse.json();
        userGroups.forEach(group => {
          activitiesList.push({
            id: `group_${group._id}`,
            type: 'group',
            title: `Joined Group: ${group.groupName}`,
            description: `You became a ${group.userRole} of ${group.groupName}`,
            date: group.creationDate || new Date().toISOString(),
            icon: 'users'
          });
        });
      }
      
      // Add payment activities
      if (paymentsResponse.ok) {
        const payments = await paymentsResponse.json();
        (payments.payments || []).forEach(payment => {
          activitiesList.push({
            id: `payment_${payment._id}`,
            type: 'payment',
            title: `Payment of ${formatCurrency(payment.amount)}`,
            description: `Payment to ${payment.groupName} - ${payment.status || 'Confirmed'}`,
            date: payment.date,
            icon: 'wallet'
          });
        });
      }
      
      // Sort by date (newest first)
      activitiesList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(activitiesList.slice(0, 20)); // Show last 20 activities
      
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    const role = group.userRole;
    const navigationState = { 
      state: { 
        groupName: group.groupName, 
        contributionAmount: group.contributionAmount,
        groupId: group._id,
        user: loggedInUser 
      } 
    };

    switch (role) {
      case 'Admin':
        navigate(`/admin-dashboard/${group._id}`, navigationState);
        break;
      case 'Treasurer':
        navigate(`/treasurer-dashboard/${group._id}`, navigationState);
        break;
      case 'Member':
        navigate(`/member-dashboard/${group._id}`, navigationState);
        break;
      default:
        navigate(`/member-dashboard/${group._id}`, navigationState);
    }
  };

  const removeGroup = (id) => {
    const updatedGroups = groups.filter(group => group._id !== id);
    setGroups(updatedGroups);
    localStorage.setItem('stokvel_groups', JSON.stringify(updatedGroups));
    setOpenMenuId(null);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation(); 
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const { 
    bankingView, 
    hasBankingDetails, 
    bankData, 
    showEmptyWarning, 
    handleViewDetails, 
    navigateToForm, 
    navigateToMenu 
  } = useBanking(loggedInUser?.email);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type) => {
    if (type === 'group') return '👥';
    if (type === 'payment') return '💰';
    return '📋';
  };

  // Load data when tabs are activated
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'wallet') {
      fetchWalletData();
    } else if (tab === 'activity') {
      fetchActivities();
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTable />;

      case 'account': 
        if (bankingView === 'form') {
          return <BankingDetails onBack={navigateToMenu} />;
        }
        if (bankingView === 'view') {
          return (<ViewBankingDetails bankData={bankData} onEdit={navigateToForm} onBack={navigateToMenu} /> );
        }
        return (
          <BankingOptions 
            hasBankingDetails={hasBankingDetails} // You can link this to a state/API later
            onViewDetails={handleViewDetails}
            onAddEditDetails={navigateToForm}
            onBack={() => setActiveTab('home')}
            showWarning={showEmptyWarning}
          />
        );
      
      case 'search':
        return (
          <section className="search-container">
            <header className="search-header">
              <h2>Search</h2>
              <p>Find groups or members to connect with</p>
            </header>
            
            <div className="search-box-wrapper">
              <div className="search-tabs">
                <button 
                  className={`search-tab ${searchType === 'groups' ? 'active' : ''}`}
                  onClick={() => setSearchType('groups')}
                >
                  Search Groups
                </button>
                <button 
                  className={`search-tab ${searchType === 'members' ? 'active' : ''}`}
                  onClick={() => setSearchType('members')}
                >
                  Search Members
                </button>
              </div>
              
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input-field"
                  placeholder={searchType === 'groups' ? 'Search by group name...' : 'Search by member name or email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-submit-btn" onClick={handleSearch} disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <section className="search-results">
                <h3>Search Results ({searchResults.length})</h3>
                <ul className="results-list">
                  {searchResults.map((result, index) => (
                    <li key={result._id || index} className="result-item">
                      <div className="result-info">
                        <h4>{result.groupName || result.name}</h4>
                        <p>{result.description || result.email}</p>
                        {result.userRole && <span className="result-role">{result.userRole}</span>}
                      </div>
                      <button className="result-action-btn">View</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {searching && <p className="search-loading">Searching...</p>}
            {!searching && searchQuery && searchResults.length === 0 && (
              <p className="search-no-results">No results found for "{searchQuery}"</p>
            )}
          </section>
        );
      
      case 'wallet':
        return (
          <section className="wallet-container">
            <header className="wallet-header">
              <h2>My Wallet</h2>
              <p>Track your contributions and payment history</p>
            </header>
            
            <div className="wallet-summary-cards">
              <div className="wallet-summary-card">
                <h3>Total Paid</h3>
                <p className="wallet-amount">{formatCurrency(walletData.totalPaid)}</p>
              </div>
              <div className="wallet-summary-card">
                <h3>Pending</h3>
                <p className="wallet-amount pending">{formatCurrency(walletData.pendingPayments)}</p>
              </div>
              <div className="wallet-summary-card">
                <h3>Transactions</h3>
                <p className="wallet-amount">{walletData.transactions.length}</p>
              </div>
            </div>
            
            <section className="wallet-transactions">
              <h3>Recent Transactions</h3>
              {walletLoading ? (
                <p className="loading-text">Loading transactions...</p>
              ) : walletData.transactions.length === 0 ? (
                <p className="no-data">No transactions found</p>
              ) : (
                <ul className="transactions-list">
                  {walletData.transactions.slice(0, 10).map((transaction) => (
                    <li key={transaction._id} className="transaction-item">
                      <div className="transaction-icon">
                        {transaction.status === 'Confirmed' ? '✅' : '⏳'}
                      </div>
                      <div className="transaction-details">
                        <p className="transaction-group">{transaction.groupName}</p>
                        <p className="transaction-date">{formatDate(transaction.date)}</p>
                      </div>
                      <div className="transaction-amount">
                        <p className={`amount-value ${transaction.status === 'Confirmed' ? 'confirmed' : 'pending'}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="transaction-status">{transaction.status || 'Pending'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </section>
        );
      
      case 'activity':
        return (
          <section className="activity-container">
            <header className="activity-header">
              <h2>Recent Activity</h2>
              <p>Stay updated with your group activities</p>
            </header>
            
            {activityLoading ? (
              <p className="loading-text">Loading activities...</p>
            ) : activities.length === 0 ? (
              <div className="no-activities">
                <Bell size={48} color="#cbd5e0" />
                <p>No recent activities</p>
                <small>Activities will appear here when you join groups or make payments</small>
              </div>
            ) : (
              <ul className="activities-list">
                {activities.map((activity) => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                    <div className="activity-content">
                      <p className="activity-title">{activity.title}</p>
                      <p className="activity-description">{activity.description}</p>
                      <time className="activity-date">{formatDate(activity.date)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      
      case 'home':
      default:
        return (
          <>
            <header className="content-header">
              <h2>My Stockvel Groups</h2>
              <button
                type="button"
                className="create-group-btn"
                onClick={() => navigate('/create-group')}
              >
                + Create a group
              </button>
            </header>

            <section className="groups-display-container">
              <article className={`status-container ${groups.length > 0 ? 'has-grid' : 'is-empty'}`}>
                {loading ? (
                  <p className="empty-msg">Loading your groups...</p>
                ) : groups.length === 0 ? (
                  <p className="empty-msg">You are currently not in any group</p>
                ) : (
                  <ul className="groups-grid">
                    {groups.map((group) => (
                      <li key={group._id}>
                        <article
                          className="group-tile"
                          onClick={() => handleGroupClick(group)}
                          style={{ cursor: 'pointer' }}
                        >
                          <header className="tile-banner"></header>
                          <section className="tile-content">
                            <h3>{group.groupName}</h3>
                            <p style={{
                              color: '#8b5cf6',
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                              margin: '4px 0'
                            }}>
                              {group.userRole}
                            </p>
                            <p>{group.frequency} • R{group.contributionAmount}</p>
                            <footer className="tile-actions">
                              <button
                                type="button"
                                className="tile-menu-btn"
                                onClick={(e) => toggleMenu(e, group._id)}
                              >
                                <MoreVertical size={18} />
                              </button>
                              {openMenuId === group._id && (
                                <ul className="tile-dropdown">
                                  <li>
                                    <button type="button" className="remove-opt" onClick={(e) => {
                                      e.stopPropagation();
                                      removeGroup(group._id);
                                    }}>
                                      <Trash2 size={14} /> Remove
                                    </button>
                                  </li>
                                </ul>
                              )}
                            </footer>
                          </section>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>
          </>
        );
    }
  };

  return (
    <section className="layout-root">
      {showSuccessToast && (
        <aside className="success-toast" role="alert" aria-live="polite">
          <figure className="toast-icon">
            <CheckCircle size={20} color="#10b981" />
          </figure>
          <section className="toast-content">
            <strong>Group Created Successfully</strong>
            <p>Your group "{newGroupName}" has been created. Invitations have been sent.</p>
          </section>
          <button className="toast-close" onClick={() => setShowSuccessToast(false)} aria-label="Close">
            ×
          </button>
        </aside>
      )}

      <header className="top-navbar">
        <h1 className="brand-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <circle cx="16" cy="16" r="16" fill="#F5C842" />
            <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="22" r="2" fill="#1A3A6B"/>
          </svg>
          StockvelStokkie
        </h1>
        <nav className="top-nav-actions">
          <NotificationBell userEmail={loggedInUser?.email} />
          <details className="profile-dropdown">
            <summary className="profile-summary">
              <User size={24} />
              <ChevronDown size={16} />
            </summary>
            <ul className="dropdown-menu">
              <li><button type="button" onClick={goToProfile}>Profile</button></li>
              <li><button type="button" onClick={() => {
                sessionStorage.clear(); 
                localStorage.removeItem('stokvel_groups');
                navigate('/'); 
              }}>Logout</button></li>
            </ul>
          </details>
        </nav>
      </header>

      <main className="content-area">
        {renderContent()}
      </main>

      <footer className="nav-container">
        <nav aria-label="Main Menu">
          <ul className="nav-list">
            <li>
              <button onClick={() => handleTabChange('home')} className={activeTab === 'home' ? 'active' : ''}>
                <House size={24} />
                <small>Home</small>
              </button>
            </li>
            <li>
              <button onClick={() => handleTabChange('search')} className={activeTab === 'search' ? 'active' : ''}>
                <Search size={24} />
                <small>Search</small>
              </button>
            </li>
            <li><button onClick={() => setActiveTab('account')} className={activeTab === 'account' ? 'active' : ''}>
              <CreditCard size={24} />
              <small>My Account Details</small>
              </button>
              </li>
            <li>
              <button onClick={() => handleTabChange('activity')} className={activeTab === 'activity' ? 'active' : ''}>
                <Bell size={24} />
                <small>Activity</small>
              </button>
            </li>
            <li>
              <button onClick={goToProfile}>
                <User size={24} />
                <small>Profile</small>
              </button>
            </li>
          </ul>
        </nav>
      </footer>
    </section>
  );
};

export default Home;
