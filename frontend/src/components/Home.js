import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import { House, Search, Wallet, Bell, User, ChevronDown, MoreVertical, Trash2, CheckCircle } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ProfileTable from './ProfileTable';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home'); 
  const [groups, setGroups] = useState([]); 
  const [openMenuId, setOpenMenuId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));

  const fetchGroups = async () => {
    try {
      if (loggedInUser && loggedInUser.email) {
        const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';
        const response = await axios.get(`${apiUrl}/stokvel/user/${loggedInUser.email}`);
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

  const handleGroupClick = (group) => {
    const role = group.userRole;
    console.log(`Navigating to ${role} dashboard for: ${group.groupName}`);
    
    switch (role) {
      case 'Admin':
        navigate(`/admin-dashboard/${group._id}`);
        break;
      case 'Treasurer':
        navigate(`/treasurer-dashboard/${group._id}`);
        break;
      case 'Member':
        navigate(`/member-dashboard/${group._id}`);
        break;
      default:
        console.warn("Unknown role detected, defaulting to Member Dashboard");
        navigate(`/member-dashboard/${group._id}`);
    }
  };

  const removeGroup = (id) => {
    setGroups(groups.filter(group => group._id !== id));
    setOpenMenuId(null);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation(); 
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTable />;
      
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
          StockvelStockkie
        </h1>
        <nav className="top-nav-actions">
          <NotificationBell userEmail={loggedInUser?.email} />
          <details className="profile-dropdown">
            <summary className="profile-summary">
              <User size={24} />
              <ChevronDown size={16} />
            </summary>
            <ul className="dropdown-menu">
              <li><button type="button" onClick={handleProfileClick}>Profile</button></li>
              <li><button type="button" onClick={() => {
                sessionStorage.clear(); 
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
            <li><button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}><House size={24} /><small>Home</small></button></li>
            <li><button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'active' : ''}><Search size={24} /><small>Search</small></button></li>
            <li><button onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? 'active' : ''}><Wallet size={24} /><small>Wallet</small></button></li>
            <li><button onClick={() => setActiveTab('activity')} className={activeTab === 'activity' ? 'active' : ''}><Bell size={24} /><small>Activity</small></button></li>
            <li><button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}><User size={24} /><small>Profile</small></button></li>
          </ul>
        </nav>
      </footer>
    </section>
  );
};

export default Home;
