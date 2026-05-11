import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user = {}, onLogout = () => {}, onUpdate = () => {} }) => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    surname: '',
    email: '',
    role: 'Member',
    createdAt: ''
  });
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user from sessionStorage with null check
  const sessionUser = sessionStorage.getItem('user');
  const loggedInUser = sessionUser ? JSON.parse(sessionUser) : {};

  useEffect(() => {
    // Log to see what data is actually in sessionStorage
    console.log('loggedInUser from sessionStorage:', loggedInUser);
    
    // Load data from sessionStorage immediately if available
    if (loggedInUser) {
      setProfileData({
        firstName: loggedInUser.name || loggedInUser.firstName || '',
        surname: loggedInUser.surname || loggedInUser.lastName || '',
        email: loggedInUser.email || 'Not set',
        role: loggedInUser.role || 'Member',
        createdAt: loggedInUser.createdAt || new Date().toISOString()
      });
    } else if (user) {
      setProfileData({
        firstName: user.name || user.firstName || '',
        surname: user.surname || user.lastName || '',
        email: user.email || 'Not set',
        role: user.role || 'Member',
        createdAt: user.createdAt || new Date().toISOString()
      });
    }
    
    fetchProfile();
    fetchUserGroups();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = loggedInUser?.email || user?.email;
      
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/users/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('API response user data:', data.user);
        
        const firstName = data.user?.name || data.user?.firstName || '';
        const surname = data.user?.surname || data.user?.lastName || '';
        
        setProfileData({
          firstName: firstName,
          surname: surname,
          email: data.user?.email || loggedInUser.email || user.email || 'Not set',
          role: data.user?.role || loggedInUser.role || user.role || 'Member',
          createdAt: data.user?.createdAt || new Date().toISOString()
        });
        
        // Update sessionStorage with correct data
        const updatedUser = {
          ...loggedInUser,
          name: firstName,
          surname: surname,
          email: data.user?.email || loggedInUser.email,
          role: data.user?.role || loggedInUser.role
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated sessionStorage:', updatedUser);
        
      } else {
        console.log('API response not OK:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const userEmail = loggedInUser?.email || user?.email;
      if (!userEmail) return;

      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/stokvel/user/${userEmail}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const groups = await response.json();
        setUserGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const navigateToGroupDashboard = (group) => {
    const role = group.userRole;
    switch (role) {
      case 'Admin':
        navigate(`/admin-dashboard/${group._id}`);
        break;
      case 'Treasurer':
        navigate(`/treasurer-dashboard/${group._id}`);
        break;
      default:
        navigate(`/member-dashboard/${group._id}`);
    }
  };

  const getFullName = () => {
    if (profileData.firstName && profileData.surname) {
      return `${profileData.firstName} ${profileData.surname}`;
    }
    if (profileData.firstName) {
      return profileData.firstName;
    }
    return 'User';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountStatus = () => {
    if (userGroups.length > 0) {
      return { text: 'Active', className: 'status-active' };
    }
    return { text: 'Inactive', className: 'status-inactive' };
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Admin': return 'badge-admin';
      case 'Treasurer': return 'badge-treasurer';
      default: return 'badge-member';
    }
  };

  const accountStatus = getAccountStatus();
  const fullName = getFullName();

  if (loading) {
    return (
      <main className="profile-container">
        <p className="loading-text">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="profile-container">
      <article className="profile-card">
        <header className="profile-back-header">
          <button type="button" className="back-button" onClick={handleBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </header>

        <header className="profile-cover">
          <figure className="profile-avatar">
            <figcaption>Profile avatar showing first letter of name</figcaption>
            <output className="avatar-large" htmlFor="profile-name" aria-label="Profile initial">
              {fullName.charAt(0) || 'U'}
            </output>
          </figure>
        </header>

        <section className="profile-info">
          <header className="profile-header-actions">
            <hgroup>
              <h1 id="profile-name">{fullName}</h1>
            </hgroup>
            <nav aria-label="Profile actions">
              <menu className="profile-actions">
                <li><button className="btn-logout" onClick={onLogout}>Logout</button></li>
              </menu>
            </nav>
          </header>

          <section className="profile-details">
            <section className="detail-section" aria-labelledby="account-info-heading">
              <h2 id="account-info-heading">Account Information</h2>
              <dl>
                <dt>First Name</dt>
                <dd>{profileData.firstName || 'Not set'}</dd>
                
                <dt>Surname</dt>
                <dd>{profileData.surname || 'Not set'}</dd>
                
                <dt>Full Name</dt>
                <dd>{fullName}</dd>
                
                <dt>Email Address</dt>
                <dd>{profileData.email || 'Not set'}</dd>
              </dl>
            </section>

            <section className="detail-section" aria-labelledby="stokvel-info-heading">
              <h2 id="stokvel-info-heading">Stokvel Information</h2>
              <dl>
                <dt>Account Created</dt>
                <dd><time dateTime={profileData.createdAt}>{formatDate(profileData.createdAt)}</time></dd>
                
                <dt>Account Status</dt>
                <dd>
                  <output className={`account-status ${accountStatus.className}`}>
                    {accountStatus.text}
                  </output>
                </dd>
              </dl>
            </section>
          </section>

          {/* User's Groups Section */}
          <section className="user-groups-section" aria-labelledby="groups-heading">
            <h2 id="groups-heading">My Groups</h2>
            {userGroups.length === 0 ? (
              <p className="no-groups">You are not a member of any group yet.</p>
            ) : (
              <ul className="groups-list">
                {userGroups.map((group) => (
                  <li key={group._id} className="group-item">
                    <button 
                      className="group-card" 
                      onClick={() => navigateToGroupDashboard(group)}
                    >
                      <header className="group-card-header">
                        <h3>{group.groupName}</h3>
                        <output className={`role-badge ${getRoleBadgeClass(group.userRole)}`}>
                          {group.userRole}
                        </output>
                      </header>
                      <footer className="group-card-footer">
                        <p>{group.frequency || 'Monthly'} • R{group.contributionAmount || 0}</p>
                        <small>Click to view dashboard →</small>
                      </footer>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </article>
    </main>
  );
};

export default Profile;
