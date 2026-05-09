import React, { useState, useEffect } from 'react';
import './ProfileTable.css';

const ProfileTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  // FIXED: Added closing quote

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://tnbt-stokvel-management-assistant.onrender.com/api/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        // Mock data for demo
        setUsers([
          { name: 'John Doe', email: 'john@example.com', role: 'Admin', memberId: 'MEM001', joinDate: '2024-01-15' },
          { name: 'Jane Smith', email: 'jane@example.com', role: 'Treasurer', memberId: 'MEM002', joinDate: '2024-02-20' },
          { name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', memberId: 'MEM003', joinDate: '2024-03-10' }
        ]);
      }
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="loading-text">Loading users...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section className="profile-table-container">
      <header className="table-header">
        <h2>All Members</h2>
        <p>Complete list of all registered members</p>
      </header>

      <table className="profile-table">
        <caption>List of all users in the Stokvel system</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Member ID</th>
            <th scope="col">Join Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.email || index}>
              <td className="name-cell">
                <figure className="user-avatar-small">
                  <figcaption className="visually-hidden">Avatar for {user.name}</figcaption>
                  {user.name?.charAt(0) || 'U'}
                </figure>
                {user.name}
              </td>
              <td>{user.email}</td>
              <td>
                <output className={`role-badge role-${user.role?.toLowerCase() || 'member'}`}>
                  {user.role || 'Member'}
                </output>
              </td>
              <td>{user.memberId || 'N/A'}</td>
              <td><time dateTime={user.joinDate}>{new Date(user.joinDate).toLocaleDateString()}</time></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default ProfileTable;