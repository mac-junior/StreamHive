import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Calendar, MessageCircle, Bookmark, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      follow: UserPlus,
      hive_reminder: Calendar,
      question_answered: MessageCircle,
      bookmark_live: Bookmark,
      hive_started: Bell
    };
    return icons[type] || Bell;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    if (notification.hiveId) {
      navigate(`/hive/${notification.hiveId._id || notification.hiveId}`);
    } else if (notification.type === 'follow' && notification.senderId) {
      navigate(`/profile/${notification.senderId._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-honey-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-900">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-honey-600 hover:text-honey-500 transition"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-700">No notifications yet</h3>
          <p className="text-charcoal-500 mt-1">You'll see notifications here when something happens</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg border p-4 cursor-pointer transition hover:shadow-md ${
                  !notification.isRead
                    ? 'border-honey-300 bg-honey-500/5'
                    : 'border-soft-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    !notification.isRead ? 'bg-honey-500/10' : 'bg-soft-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      !notification.isRead ? 'text-honey-500' : 'text-charcoal-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-medium text-charcoal-900' : 'text-charcoal-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-charcoal-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-honey-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;