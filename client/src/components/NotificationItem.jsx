import { UserPlus, Calendar, MessageCircle, Bookmark, Bell, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    const icons = {
      follow: UserPlus,
      hive_reminder: Calendar,
      question_answered: MessageCircle,
      bookmark_live: Bookmark,
      hive_started: Play,
    };
    const Icon = icons[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    
    if (notification.hiveId) {
      navigate(`/hive/${notification.hiveId._id || notification.hiveId}`);
    } else if (notification.type === 'follow' && notification.senderId) {
      navigate(`/profile/${notification.senderId._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition hover:shadow-md ${
        !notification.isRead
          ? 'border-honey-300 bg-honey-500/5'
          : 'border-soft-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          !notification.isRead ? 'bg-honey-500/10 text-honey-500' : 'bg-soft-gray-100 text-charcoal-400'
        }`}>
          {getIcon(notification.type)}
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
};

export default NotificationItem;