import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('email');
  const token = localStorage.getItem('token');
  //const apiUrl = 'http://localhost:5000/api';
  const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${apiUrl}/notifications/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const openNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await fetch(`${apiUrl}/notifications/${notification._id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate(`/notifications/${notification._id}`);
    } catch (err) {
      console.error('Failed to open notification:', err);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>All Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications found</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => openNotification(n)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '12px',
              background: n.isRead ? '#fff' : '#eef3ff',
              cursor: 'pointer'
            }}
          >
            <strong>{n.title}</strong>
            <p>{n.message}</p>
            <small>{new Date(n.createdAt).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPage;