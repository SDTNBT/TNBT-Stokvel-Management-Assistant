import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ userEmail }) => {

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // API base URL
  const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (userEmail) fetchNotifications();
  }, [userEmail]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${apiUrl}/notifications/${userEmail}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${apiUrl}/notifications/${id}/read`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${apiUrl}/notifications/read-all/${userEmail}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const typeColor = (type) => {
    if (type === 'meeting') return '#1A3A6B';
    if (type === 'payment') return '#2e7d32';
    return '#F5C842';
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}   
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '44px',
          width: '320px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #eee'
          }}>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>
              Notifications
            </span>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1A3A6B',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          {notifications.length === 0 ? (
            <p style={{
              padding: '20px',
              textAlign: 'center',
              color: '#999',
              fontSize: '13px'
            }}>
              No notifications yet
            </p>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}  // only mark read
                style={{
                  padding: '12px 16px',
                  borderBottom: '0.5px solid #f0f0f0',
                  cursor: 'pointer',
                  background: n.isRead ? 'transparent' : '#f0f4ff'
                }}
              >
                {/* Top Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    background: typeColor(n.type),
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}>
                    {n.type}
                  </span>

                  {!n.isRead && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#e74c3c',
                      alignSelf: 'center'
                    }} />
                  )}
                </div>

                {/* Title */}
                <p style={{
                  margin: '0 0 2px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {n.title}
                </p>

                {/* Message */}
                <p style={{
                  margin: '0 0 4px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {n.message}
                </p>

                {/* Date */}
                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#999'
                }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>

               
                <button
                  onClick={async (e) => {
                    e.stopPropagation(); // prevent parent click

                    if (!n.isRead) {
                      await markAsRead(n._id);
                    }

                    navigate(`/notifications/${n._id}`);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0066cc',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    padding: 0,
                    marginTop: '6px'
                  }}
                >
                  View full notification
                </button>

              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;