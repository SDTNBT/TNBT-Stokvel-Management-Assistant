import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyGroups.css';

const MyGroups = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedInUser = JSON.parse(sessionStorage.getItem('user')) || user;

  useEffect(() => {
    fetchGroups();
  }, []);

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
      default:
        navigate(`/member-dashboard/${group._id}`, navigationState);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <main className="my-groups-container">
        <p>Loading your groups...</p>
      </main>
    );
  }

  return (
    <main className="my-groups-container">
      <header className="my-groups-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
        <h1>My Groups</h1>
      </header>

      <section className="my-groups-list">
        {groups.length === 0 ? (
          <p className="no-groups">You are not a member of any group yet.</p>
        ) : (
          <ul className="groups-grid">
            {groups.map((group) => (
              <li key={group._id}>
                <article className="group-card" onClick={() => handleGroupClick(group)}>
                  <h3>{group.groupName}</h3>
                  <p className="group-role">{group.userRole}</p>
                  <p className="group-details">{group.frequency} • R{group.contributionAmount}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default MyGroups;
