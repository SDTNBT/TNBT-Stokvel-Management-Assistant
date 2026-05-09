import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user = {}, onLogout = () => {}, onUpdate = () => {} }) => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    role: 'Member'
  });
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user from sessionStorage directly
  const loggedInUser = JSON.parse(sessionStorage.getItem('user')) || {};

  useEffect(() => {
    fetchProfile();
    fetchUserGroups();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = loggedInUser.email;
      
      if (!userEmail) {
        setProfileData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          fullName: user?.name || user?.fullName || 'User',
          email: user?.email || 'Not set',
          role: user?.role || 'Member'
        });
        setLoading(false);
        return;
      }

      // Fetch user data from API
      const response = await fetch(`https://tnbt-stokvel-management-assistant.onrender.com/api/users/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if database has separate firstName/lastName or combined name
        const firstName = data.user?.firstName || '';
        const lastName = data.user?.lastName || '';
        const fullName = data.user?.name || data.user?.fullName || `${firstName} ${lastName}`.trim() || 'User';
        
        setProfileData({
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          email: data.user?.email || loggedInUser.email || 'Not set',
          role: data.user?.role || loggedInUser.role || 'Member'
        });
      } else {
        // Fallback to sessionStorage data
        const fullName = loggedInUser.name || loggedInUser.fullName || user?.name || 'User';
        setProfileData({
          firstName: loggedInUser.firstName || '',
          lastName: loggedInUser.lastName || '',
          fullName: fullName,
          email: loggedInUser.email || user?.email || 'Not set',
          role: loggedInUser.role || user?.role || 'Member'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const fullName = loggedInUser.name || loggedInUser.fullName || user?.name || 'User';
      setProfileData({
        firstName: loggedInUser.firstName || '',
        lastName: loggedInUser.lastName || '',
        fullName: fullName,
        email: loggedInUser.email || user?.email || 'Not set',
        role: loggedInUser.role || user?.role || 'Member'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const userEmail = loggedInUser.email;
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

  const getRoleClassName = () => {
    const role = profileData.role?.toLowerCase() || 'member';
    return `profile-role role-${role}`;
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Admin': return 'badge-admin';
      case 'Treasurer': return 'badge-treasurer';
      default: return 'badge-member';
    }
  };

  const getRoleAriaLabel = () => {
    switch(profileData.role) {
      case 'Admin': return 'Administrator role';
      case 'Treasurer': return 'Treasurer role';
      default: return 'Member role';
    }
  };

  // Get display name (prefer fullName, then firstName + lastName, then fallback)
  const getDisplayName = () => {
    if (profileData.fullName && profileData.fullName !== 'User') {
      return profileData.fullName;
    }
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    if (profileData.firstName) {
      return profileData.firstName;
    }
    return 'User';
  };

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
        {/* Back Button */}
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
              {getDisplayName().charAt(0) || 'U'}
            </output>
          </figure>
        </header>

        <section className="profile-info">
          <header className="profile-header-actions">
            <hgroup>
              <h1 id="profile-name">{getDisplayName()}</h1>
              <p aria-label={getRoleAriaLabel()}>
                <output className={getRoleClassName()}>
                  {profileData.role || 'Member'}
                </output>
              </p>
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
                
                <dt>Last Name / Surname</dt>
                <dd>{profileData.lastName || 'Not set'}</dd>
                
                <dt>Full Name</dt>
                <dd>{getDisplayName()}</dd>
                
                <dt>Email Address</dt>
                <dd>{profileData.email || 'Not set'}</dd>
              </dl>
            </section>

            <section className="detail-section" aria-labelledby="stokvel-info-heading">
              <h2 id="stokvel-info-heading">Stokvel Information</h2>
              <dl>
                <dt>Member Since</dt>
                <dd><time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString()}</time></dd>
                
                <dt>Account Status</dt>
                <dd>Active</dd>
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
