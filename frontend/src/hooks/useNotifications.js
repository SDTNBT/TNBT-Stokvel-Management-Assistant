import { useState, useEffect, useMemo, useCallback } from 'react';

export const useNotifications = (userEmail) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const apiRoot = useMemo(() => {
    const isLocal = window.location.hostname === 'localhost';
    return isLocal ? 'http://localhost:5000' : 'https://tnbt-stokvel-management-assistant.onrender.com';
  }, []);

  // Wrap in useCallback to fix the dependency warning
  const fetchMyNotifications = useCallback(async () => {
    if (!userEmail) {
      console.log("No userEmail provided to hook.");
      return;
    }
    
    try {
      // Encode email to ensure characters like @ are sent correctly
      const url = `${apiRoot}/api/notifications/my-notifications?email=${encodeURIComponent(userEmail)}`;
      console.log("Fetching notifications for:", userEmail);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        return;
      }

      const data = await response.json();
      
      // If the API returns [], this log will confirm the backend isn't finding records
      console.log("Raw API Response for", userEmail, ":", data);

      const result = Array.isArray(data) ? data : (data.notifications || []);
      setNotifications(result);
    } catch (err) {
      console.error('Failed fetching notifications:', err);
    }
  }, [userEmail, apiRoot]); // Dependencies are now correct

  useEffect(() => {
    fetchMyNotifications();
    const interval = setInterval(fetchMyNotifications, 35000);
    return () => clearInterval(interval);
  }, [fetchMyNotifications]); // useEffect now reacts to the stable callback

  const paymentNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];
    
    return notifications.filter(n => {
      const type = n.type ? String(n.type).trim().toLowerCase() : '';
      return type === 'payment';
    });
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return paymentNotifications.filter(n => !n.isRead).length;
  }, [paymentNotifications]);

  const handleDismissNotification = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`${apiRoot}/api/notifications/my-notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  return {
    notifications,
    paymentNotifications,
    isNotifOpen,
    setIsNotifOpen,
    unreadCount,
    handleDismissNotification
  };
};