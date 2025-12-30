import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../contentApi/AuthContext';
import { setupAxiosInterceptors, handleApiError } from '../utils/apiErrorHandler';

const NotificationContext = createContext();

// Setup axios with interceptors for automatic 401 handling
const apiClient = setupAxiosInterceptors(axios.create());

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60 * 1000 ); // Poll every 60 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch unread notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await axios.get(
        `https://bkdemo1.clinicpro.cc/notification/unread-notifications`
      );

      // If the API returns notifications with appointment_id, map them
      if (response.data && Array.isArray(response.data)) {
        const mappedNotifications = response.data.map((notification) => ({
          id: notification.id,
          title: notification.title || "New Notification",
          message: notification.message || "",
          type: notification.type || "info",
          appointmentId: notification.appointment_id,
          createdAt: notification.created_at || new Date().toISOString(),
          isRead: notification.is_read || false,
          // Add any other fields your API returns
          ...notification
        }));

        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.length);
      }
    } catch (err) {
      handleApiError(err, "Failed to fetch notifications");
    }
  };

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`https://bkdemo1.clinicpro.cc/notification/read/${notificationId}`);

      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error("Error marking notification as read", err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.post(`https://bkdemo1.clinicpro.cc/notification/mark-all-read`);

      // Clear all notifications from local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read", err);
      throw err;
    }
  };

  // Get notification by ID
  const getNotificationById = (id) => {
    return notifications.find(notification => notification.id === id);
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  // Clear all notifications (local only)
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Refresh notifications manually
  const refreshNotifications = () => {
    fetchNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationById,
    getNotificationsByType,
    clearAllNotifications,
    refreshNotifications,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};