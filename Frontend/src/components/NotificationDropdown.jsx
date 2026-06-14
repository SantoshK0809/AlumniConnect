import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, deleteNotification } from '../api/notificationApi';
import { socket } from '../api/socket';
import { useConnections } from '../hooks/useConnections';

/* ─── Time Formatter ─── */
const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ─── Type-Based Icons ─── */
const getNotificationIcon = (type) => {
  // Map backend notification types to icons
  const iconMap = {
    'FEED_LIKE': { color: 'red', icon: '❤️' },
    'FEED_COMMENT': { color: 'blue', icon: '💬' },
    'FRIEND_REQUEST_RECEIVED': { color: 'purple', icon: '👤' },
    'FRIEND_REQUEST_ACCEPTED': { color: 'green', icon: '✓' },
    'NEW_MESSAGE': { color: 'blue', icon: '💌' },
    'MENTION': { color: 'yellow', icon: '@' },
    'NEW_POST': { color: 'indigo', icon: '📝' },
    'SYSTEM_ALERT': { color: 'gray', icon: '⚠️' },
  };

  const config = iconMap[type] || iconMap['SYSTEM_ALERT'];
  const colorClasses = {
    'red': 'bg-red-500/10 text-red-500',
    'blue': 'bg-blue-500/10 text-blue-500',
    'purple': 'bg-purple-500/10 text-purple-500',
    'green': 'bg-green-500/10 text-green-500',
    'yellow': 'bg-yellow-500/10 text-yellow-500',
    'indigo': 'bg-indigo-500/10 text-indigo-500',
    'gray': 'bg-gray-500/10 text-gray-500',
  };

  return (
    <div className={`w-9 h-9 rounded-full ${colorClasses[config.color]} flex items-center justify-center flex-shrink-0 text-lg`}>
      {config.icon}
    </div>
  );
};

/* ─── Get Display Message from Metadata ─── */
const getNotificationMessage = (notification) => {
  const { type, metadata, sender } = notification;
  const userName = sender?.name || metadata?.senderName || 'Someone';

  // Customize message based on type and metadata
  switch (type) {
    case 'FEED_LIKE':
      return `${userName} liked your post`;
    case 'FEED_COMMENT':
      return `${userName} commented on your post`;
    case 'FRIEND_REQUEST_RECEIVED':
      return `${userName} sent you a connection request`;
    case 'FRIEND_REQUEST_ACCEPTED':
      return `${userName} accepted your connection request`;
    case 'NEW_MESSAGE':
      return `${userName} sent you a message`;
    case 'MENTION':
      return `${userName} mentioned you`;
    case 'NEW_POST':
      return `${userName} posted something new`;
    default:
      return metadata?.message || 'You have a new notification';
  }
};

/* ────────────────────────────────────────────────────────
   NotificationDropdown
   
   Integrated with Backend:
   
   API Endpoints:
   - GET /api/notifications → Fetch user notifications (cursor-based pagination)
   - GET /api/notifications/unread-count → Fetch unread count
   - PATCH /api/notifications/read-all → Mark all as read
   - DELETE /api/notifications/:id → Delete notification
   
   Real-time Events (Socket.io):
   - notification:new → New notification arrived
   - notification:deleted → Notification deleted
──────────────────────────────────────────────────────── */

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { acceptConnectionRequest, rejectConnectionRequest } = useConnections();
  const dropdownRef = useRef(null);
  const [lastReadAt, setLastReadAt] = useState(null);

  const handleAcceptConnection = async (requesterId, notificationId) => {
    try {
      await acceptConnectionRequest(requesterId);
      // Mark notification as read and update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true, type: 'FRIEND_REQUEST_ACCEPTED' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to accept connection:", err);
    }
  };

  const handleRejectConnection = async (requesterId, notificationId) => {
    try {
      await rejectConnectionRequest(requesterId);
      // Mark notification as read or delete
      handleDeleteNotification(notificationId);
    } catch (err) {
      console.error("Failed to reject connection:", err);
    }
  };

  const INITIAL_SHOW_COUNT = 3;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, INITIAL_SHOW_COUNT);
  const hasMore = notifications.length > INITIAL_SHOW_COUNT;

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on('notification:new', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen for deleted notifications
    socket.on('notification:deleted', ({ notificationId }) => {
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:deleted');
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      // Update local state to reflect read status
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setError("Failed to update notifications");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Failed to update notification");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError("Failed to delete notification");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors relative cursor-pointer
          ${isOpen
            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
          }`}
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white
            text-[10px] font-bold rounded-full flex items-center justify-center px-1
            shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)]
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-2xl z-50 overflow-hidden
          animate-dropdown">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700
            flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40
                  text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800
                  dark:hover:text-blue-300 font-medium transition-colors cursor-pointer">
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="py-8 px-4 text-center">
                <div className="inline-block">
                  <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading notifications...</p>
              </div>
            )}
            
            {!loading && error && (
              <div className="py-8 px-4 text-center">
                <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                <button
                  onClick={() => {
                    fetchNotifications();
                    fetchUnreadCount();
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                  Try again
                </button>
              </div>
            )}
            
            {!loading && notifications.length === 0 ? (
              <div className="py-14 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700
                  flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No notifications yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  When someone interacts with you, it'll show up here
                </p>
              </div>
            ) : !loading && (
              displayedNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  className={`flex items-start gap-3 px-4 py-3.5 transition-all duration-200
                    border-b border-gray-50 dark:border-gray-700/50 last:border-0
                    hover:bg-gray-50 dark:hover:bg-gray-700/40
                    ${notif.read ? 'bg-white dark:bg-gray-800' : 'bg-gradient-to-r from-blue-50/60 to-transparent dark:from-blue-900/10 dark:to-transparent cursor-pointer'}`}
                >
                  {/* Icon */}
                  {getNotificationIcon(notif.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug text-gray-900 dark:text-white font-medium">
                      {getNotificationMessage(notif)}
                    </p>
                    
                    {notif.type === 'FRIEND_REQUEST_RECEIVED' && !notif.read && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptConnection(notif.sender?._id || notif.metadata?.senderId, notif._id);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectConnection(notif.sender?._id || notif.metadata?.senderId, notif._id);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteNotification(notif._id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0 mt-1
                      transition-colors px-1 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete notification"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700
              bg-gray-50/80 dark:bg-gray-800/80 flex items-center justify-between">
              {hasMore ? (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium
                    hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer
                    flex items-center justify-center gap-1 flex-1">
                  {showAll ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Show less
                    </>
                  ) : (
                    <>
                      View all ({notifications.length})
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : null}
              <button
                onClick={() => {
                  fetchNotifications();
                  fetchUnreadCount();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5
                  transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Refresh notifications"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown {
          animation: dropdown-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
