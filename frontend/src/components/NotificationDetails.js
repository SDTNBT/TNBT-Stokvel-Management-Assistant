import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  CheckCircle,
  FileText
} from 'lucide-react';

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('email');
  const token = localStorage.getItem('token');
  //const apiUrl = 'http://localhost:5000/api';
  const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch(`${apiUrl}/notifications/${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
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

  const formatMeetingDate = (dateValue) => {
    if (!dateValue) return 'Not provided';
    return new Date(dateValue).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getLocationText = () => {
    const details = notification?.details;
    if (!details) return 'Not provided';

    if (details.locationType === 'online') {
      return details.meetingLink || details.platform || 'Online meeting';
    }

    return details.physicalLocation || 'Not provided';
  };

  const getNotificationCategory = () => {
    if (notification.type === 'meeting') return 'Meeting';
    if (notification.type === 'announcement') return 'Agenda';
    return 'Notification';
  };

  const getSenderName = () => {
    if (notification.type === 'meeting') return 'StokvèlHub Meeting Management';
    if (notification.type === 'announcement') return 'StokvèlHub Agenda Management';
    return 'StokvèlHub Notification System';
  };

  if (loading) {
    return <p style={{ padding: '24px' }}>Loading notification...</p>;
  }

  if (!notification) {
    return (
      <main style={styles.page}>
        <section style={styles.container}>
          <h2>Notification not found</h2>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            Back
          </button>
        </section>
      </main>
    );
  }

  const details = notification.details || {};

  return (
    <main style={styles.page}>
      <section style={styles.phoneFrame}>
        <header style={styles.topBar}>
          <button style={styles.iconButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>

          <span style={styles.topTitle}>Notification Detail</span>
          <span style={styles.moreDots}>⋮</span>
        </header>

        <nav style={styles.breadcrumb}>
          <span>StokvèlHub</span>
          <span>›</span>
          <span>{getNotificationCategory()}</span>
          <span>›</span>
          <strong>Notification</strong>
        </nav>

        <section style={styles.senderRow}>
          <div style={styles.avatar}>SH</div>

          <div>
            <p style={styles.senderName}>{getSenderName()}</p>
            <p style={styles.senderSub}>System Notification</p>
          </div>
        </section>

        <section style={styles.titleSection}>
          <h1 style={styles.notificationTitle}>{notification.title}</h1>
          <p style={styles.createdDate}>
            {notification.type === 'meeting'
              ? `Scheduled for ${details.meetingDate || 'Not provided'}`
              : `Posted for ${details.agendaDate || 'Not provided'}`}
          </p>
        </section>

        {notification.type === 'meeting' && (
          <section style={styles.detailsCard}>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>DATE</span>
                <p style={styles.detailValue}>
                  <Calendar size={14} color="#006b4f" />
                  {formatMeetingDate(details.meetingDate)}
                </p>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>TIME</span>
                <p style={styles.detailValue}>
                  <Clock size={14} color="#006b4f" />
                  {details.startTime || 'N/A'} - {details.endTime || 'N/A'}
                </p>
              </div>
            </div>

            <hr style={styles.divider} />

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>GROUP</span>
              <p style={styles.detailValue}>
                <Users size={14} color="#006b4f" />
                {details.groupName || 'Not provided'}
              </p>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>LOCATION</span>
              <p style={styles.detailValue}>
                {details.locationType === 'online' ? (
                  <Video size={14} color="#006b4f" />
                ) : (
                  <MapPin size={14} color="#006b4f" />
                )}
                {getLocationText()}
              </p>
            </div>
          </section>
        )}

        {notification.type === 'announcement' && (
          <section style={styles.detailsCard}>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>AGENDA DATE</span>
                <p style={styles.detailValue}>
                  <Calendar size={14} color="#006b4f" />
                  {details.agendaDate || 'Not provided'}
                </p>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>AGENDA TIME</span>
                <p style={styles.detailValue}>
                  <Clock size={14} color="#006b4f" />
                  {details.agendaTime || 'Not provided'}
                </p>
              </div>
            </div>

            <hr style={styles.divider} />

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>GROUP</span>
              <p style={styles.detailValue}>
                <Users size={14} color="#006b4f" />
                {details.groupName || 'Not provided'}
              </p>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>AGENDA TITLE</span>
              <p style={styles.detailValue}>
                <FileText size={14} color="#006b4f" />
                {details.agendaTitle || notification.title}
              </p>
            </div>
          </section>
        )}

        <section style={styles.descriptionSection}>
          <h3 style={styles.descriptionHeading}>
            {notification.type === 'announcement' ? 'Agenda Content' : 'Description'}
          </h3>

          {notification.type === 'announcement' ? (
            <div
              style={styles.descriptionBox}
              dangerouslySetInnerHTML={{
                __html:
                  details.agendaContent ||
                  notification.message ||
                  'No agenda content provided.'
              }}
            />
          ) : (
            <div style={styles.descriptionBox}>
              {notification.message || 'No description was provided.'}
            </div>
          )}
        </section>

        <section style={styles.statusRow}>
          <CheckCircle size={14} color="#009b72" />
          <span>Status: {notification.isRead ? 'Read' : 'Unread'}</span>
        </section>

        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back to Notifications
        </button>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f7fb',
    padding: 'clamp(12px, 3vw, 40px)',
    boxSizing: 'border-box'
  },

  phoneFrame: {
    width: '100%',
    maxWidth: 'min(1100px, 100%)',
    minHeight: 'calc(100vh - 80px)',
    margin: '0 auto',
    background: '#f8fbff',
    borderRadius: 'clamp(8px, 2vw, 18px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    paddingBottom: 'clamp(18px, 3vw, 34px)',
    boxSizing: 'border-box'
  },

  topBar: {
    height: '54px',
    background: '#ffffff',
    borderBottom: '1px solid #e7edf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px'
  },

  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#006b4f',
    display: 'flex',
    alignItems: 'center'
  },

  topTitle: {
    fontWeight: '700',
    color: '#003f2f',
    fontSize: '15px'
  },

  moreDots: {
    fontSize: '22px',
    color: '#006b4f'
  },

  breadcrumb: {
    display: 'flex',
    gap: '8px',
    padding: 'clamp(12px, 2vw, 18px) clamp(16px, 3vw, 40px) 8px',
    fontSize: '11px',
    color: '#6b7280',
    flexWrap: 'wrap'
  },

  senderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px clamp(16px, 3vw, 40px)'
  },

  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#007f62',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700'
  },

  senderName: {
    margin: 0,
    fontWeight: '700',
    color: '#1f2937',
    fontSize: '13px'
  },

  senderSub: {
    margin: '2px 0 0',
    fontSize: '11px',
    color: '#6b7280'
  },

  titleSection: {
    padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 40px) 8px'
  },

  notificationTitle: {
    margin: 0,
    color: '#004d3b',
    fontSize: '22px',
    lineHeight: '1.2'
  },

  createdDate: {
    margin: '6px 0 0',
    fontSize: '12px',
    color: '#6b7280'
  },

  detailsCard: {
    margin: 'clamp(14px, 2vw, 24px) clamp(16px, 3vw, 40px)',
    background: '#ffffff',
    borderRadius: '12px',
    padding: 'clamp(14px, 2vw, 20px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    borderBottom: '3px solid #00b982'
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px'
  },

  detailItem: {
    marginBottom: '10px'
  },

  detailLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: '6px'
  },

  detailValue: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#1f2937',
    fontSize: '13px',
    flexWrap: 'wrap'
  },

  divider: {
    border: 'none',
    borderTop: '1px solid #eef2f7',
    margin: '12px 0'
  },

  descriptionSection: {
    padding: '0 clamp(16px, 3vw, 40px)'
  },

  descriptionHeading: {
    borderLeft: '4px solid #00a878',
    paddingLeft: '10px',
    color: '#1f2937',
    fontSize: '15px',
    margin: '14px 0'
  },

  descriptionBox: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '14px',
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },

  statusRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '6px',
    padding: '18px clamp(16px, 3vw, 40px)',
    color: '#007f62',
    fontSize: '12px',
    fontStyle: 'italic'
  },

  backButton: {
    margin: '8px clamp(16px, 3vw, 40px) 0',
    width: 'calc(100% - clamp(32px, 6vw, 80px))',
    height: '48px',
    border: 'none',
    borderRadius: '8px',
    background: '#005b43',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 10px rgba(0,91,67,0.25)'
  },

  container: {
    background: 'white',
    padding: '24px',
    borderRadius: '10px'
  }
};

export default NotificationDetails;