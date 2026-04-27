import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('email');
  const token = localStorage.getItem('token');
  const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch(`${apiUrl}/notifications/${userEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        const selected = data.find((n) => n._id === id);

        setNotification(selected || null);
      } catch (err) {
        console.error('Failed to load notification:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id, userEmail, token]);

  const formatFullDate = (dateValue) => {
    return new Date(dateValue).toLocaleString('en-ZA', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSenderName = (type) => {
    if (type === 'meeting') return 'StokvèlHub Meeting Management';
    if (type === 'payment') return 'StokvèlHub Payment Management';
    if (type === 'announcement') return 'StokvèlHub Announcements';
    return 'StokvèlHub System';
  };

  if (loading) {
    return <p style={{ padding: '24px' }}>Loading notification...</p>;
  }

  if (!notification) {
    return (
      <div style={{ padding: '24px' }}>
        <h2>Notification not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f5f6f8',
      padding: '30px'
    }}>
      <h1 style={{
        margin: '0 0 20px',
        fontSize: '34px',
        color: '#202428'
      }}>
        Notifications
      </h1>

      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #ddd',
          background: '#fff'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {notification.title}
          </h2>

          <p style={{
            margin: '8px 0 0',
            color: '#666',
            fontSize: '14px'
          }}>
            {formatFullDate(notification.createdAt)}
          </p>
        </div>

        {/* Breadcrumb-like row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e5e5',
          color: '#0066cc',
          fontSize: '18px'
        }}>
          <span>StokvèlHub</span>
          <span>»</span>
          <span>{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</span>
          <span>»</span>
          <span>Notification</span>
        </div>

        {/* Main Notification Content */}
        <article style={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr',
          borderBottom: '1px solid #ddd'
        }}>
          {/* Avatar / Initials */}
          <div style={{
            padding: '16px',
            borderRight: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              color: '#555'
            }}>
              SH
            </div>
          </div>

          {/* Message Body */}
          <div style={{ padding: '16px 22px' }}>
            <h3 style={{
              margin: '0 0 8px',
              fontSize: '21px',
              color: '#222'
            }}>
              {notification.title}
            </h3>

            <p style={{
              margin: '0 0 20px',
              color: '#333',
              fontSize: '16px'
            }}>
              by <span style={{ color: '#0066cc' }}>{getSenderName(notification.type)}</span>
              {' '}— {formatFullDate(notification.createdAt)}
            </p>

            {/* Meeting Details */}
            {notification.type === 'meeting' && notification.details && (
              <section style={{
                margin: '18px 0',
                padding: '14px 16px',
                background: '#f7f9fc',
                border: '1px solid #e1e5ea',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '17px' }}>
                  Meeting Details
                </h4>

                <p style={{ margin: '6px 0' }}>
                  <strong>Date:</strong> {notification.details.meetingDate || 'Not provided'}
                </p>

                <p style={{ margin: '6px 0' }}>
                  <strong>Time:</strong> {notification.details.startTime || 'N/A'} - {notification.details.endTime || 'N/A'}
                </p>

                <p style={{ margin: '6px 0' }}>
                  <strong>Group:</strong> {notification.details.groupName || 'Not provided'}
                </p>

                <p style={{ margin: '6px 0' }}>
                  <strong>Location:</strong>{' '}
                  {notification.details.locationType === 'online'
                    ? notification.details.platform || 'Online'
                    : notification.details.physicalLocation || 'Not provided'}
                </p>
              </section>
            )}

            {/* Description */}
            <h4 style={{ margin: '18px 0 8px', fontSize: '17px' }}>
              Description
            </h4>

            <div style={{
              fontSize: '17px',
              lineHeight: '1.7',
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {notification.message || 'No description was provided.'}
            </div>
          </div>
        </article>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafafa'
        }}>
          <span style={{
            fontSize: '14px',
            color: notification.isRead ? '#2e7d32' : '#e67e22'
          }}>
            Status: {notification.isRead ? 'Read' : 'Unread'}
          </span>

          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#1A3A6B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 14px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotificationDetails;