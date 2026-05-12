import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = ({ userEmail }) => {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // Local testing
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Production
  // const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (userEmail) fetchNotifications();
  }, [userEmail]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${apiUrl}/notifications/${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setNotifications(data);
      }

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        `${apiUrl}/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? { ...n, isRead: true }
            : n
        )
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
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          isRead: true
        }))
      );

    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const respondToInvite = async (id, response) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        `${apiUrl}/notifications/${id}/${response}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? {
                ...n,
                isRead: true,
                action: {
                  ...n.action,
                  status:
                    response === 'accept'
                      ? 'accepted'
                      : 'declined'
                }
              }
            : n
        )
      );

    } catch (err) {
      console.error(`Failed to ${response} invite:`, err);
    }
  };

  const typeColor = (type) => {
    if (type === 'meeting') return '#1A3A6B';
    if (type === 'payment') return '#2e7d32';
    if (type === 'invite') return '#2563C8';

    return '#F5C842';
  };

  const renderInviteActions = (n) => {

    if (n.type !== 'invite') return null;

    if (n.action?.status === 'accepted') {
      return (
        <p className="nb-invite-resolved">
          ✓ You joined this group
        </p>
      );
    }

    if (n.action?.status === 'declined') {
      return (
        <p className="nb-invite-resolved">
          ✕ Invite declined
        </p>
      );
    }

    return (
      <footer className="nb-invite-actions">

        <button
          className="nb-accept-btn"
          onClick={(e) => {
            e.stopPropagation();
            respondToInvite(n._id, 'accept');
          }}
        >
          Accept
        </button>

        <button
          className="nb-decline-btn"
          onClick={(e) => {
            e.stopPropagation();
            respondToInvite(n._id, 'decline');
          }}
        >
          Decline
        </button>

      </footer>
    );
  };

  return (

    <aside
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >

      {/* Notification Bell */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px'
        }}
      >

        <Bell size={20} color="#1A3A6B" />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
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
            }}
          >
            {unreadCount}
          </span>
        )}

      </button>

      {/* Notifications Dropdown */}
      {open && (
        <dialog
          open
          aria-label="Notifications"
          style={{
            position: 'absolute',
            right: 0,
            left: 'auto',
            top: '44px',
            width: '320px',
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            padding: 0,
            margin: 0
          }}
        >

          {/* Header */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #eee'
            }}
          >

            <span
              style={{
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
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

          </header>

          {/* Notification Content */}
          {notifications.length === 0 ? (

            <p
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#999',
                fontSize: '13px'
              }}
            >
              No notifications yet
            </p>

          ) : (

            <ol
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}
            >

              {notifications.map(n => (

                <li key={n._id}>

                  <article
                    onClick={() => {
                      if (!n.isRead && n.action?.type !== 'invite') {
                        markAsRead(n._id);
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '0.5px solid #f0f0f0',
                      cursor:
                        (!n.isRead && n.action?.type !== 'invite')
                          ? 'pointer'
                          : 'default',
                      background:
                        n.isRead
                          ? 'transparent'
                          : '#f0f4ff'
                    }}
                  >

                    {/* Type + unread dot */}
                    <section
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}
                    >

                      <span
                        style={{
                          background: typeColor(n.type),
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}
                      >
                        {n.type}
                      </span>

                      {!n.isRead && (
                        <span
                          aria-hidden="true"
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#e74c3c',
                            alignSelf: 'center'
                          }}
                        />
                      )}

                    </section>

                    {/* Title */}
                    <p
                      style={{
                        margin: '0 0 2px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      {n.title}
                    </p>

                    {/* Message */}
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: '12px',
                        color: '#666'
                      }}
                    >
                      {n.message}
                    </p>

                    {/* Date */}
                    <time
                      dateTime={n.createdAt}
                      style={{
                        display: 'block',
                        margin: '0 0 8px',
                        fontSize: '11px',
                        color: '#999'
                      }}
                    >
                      {new Date(n.createdAt).toLocaleDateString()}
                    </time>

                    {/* Invite Actions */}
                    {renderInviteActions(n)}

                    {/* View Full Notification */}
                    <button
                      onClick={async (e) => {

                        e.stopPropagation();

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

                  </article>

                </li>

              ))}

            </ol>

          )}

        </dialog>
      )}

    </aside>
  );
};

export default NotificationBell;