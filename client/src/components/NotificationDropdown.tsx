import { useState, useRef } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  notificationApi
} from '../features/notifications/notificationApi';
import { useAppDispatch } from '../hooks/useOnClickOutside'; 
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import clsx from 'clsx';
import moment from 'moment';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  const dispatch = useAppDispatch(); // ✅ استخدم hook مرة واحدة داخل الكمبوننت

  const { data: notifications = [], isLoading } = useGetNotificationsQuery({});
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAll = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error('Mark all failed:', err);
    }
  };

  const handleClickNotification = async (notif: any) => {
    if (!notif.isRead) {
      // ✅ Optimistic update مباشرة
      dispatch(
        notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
          const target = draft.find((n: any) => n._id === notif._id);
          if (target) {
            target.isRead = true;
          }
        })
      );

      // ✅ Call server mutation in background
      try {
        await markAsRead(notif._id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  return (
    <div className="relative flex items-center" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2">
        <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-0 left-full ml-4 w-80 max-h-[400px] overflow-y-auto rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 font-bold">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <CheckCircle2 size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n._id}
                  onClick={() => handleClickNotification(n)}
                  className={clsx(
                    'px-4 py-2 text-sm border-b dark:border-gray-700 cursor-pointer',
                    n.isRead
                      ? 'text-gray-500'
                      : 'text-black dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-400">{moment(n.createdAt).fromNow()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
