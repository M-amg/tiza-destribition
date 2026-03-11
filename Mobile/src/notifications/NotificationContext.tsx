import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notificationApi';

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
const POLL_INTERVAL_MS = 10000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { authorizedRequest, isAuthenticated, isReady, user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const nextNotifications = await authorizedRequest((token) => fetchNotifications(token));
      setNotifications(nextNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await authorizedRequest((token) => markNotificationAsRead(token, notificationId));
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true, readAt: new Date().toISOString() } : notification,
      ),
    );
  };

  const markAllAsRead = async () => {
    await authorizedRequest((token) => markAllNotificationsAsRead(token));
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true, readAt })));
  };

  useEffect(() => {
    if (!isReady || !isAuthenticated || !user) {
      setNotifications([]);
      return;
    }

    void refresh();
    const intervalId = setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isReady, isAuthenticated, user?.id]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      isLoading,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, isLoading],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }

  return context;
}
