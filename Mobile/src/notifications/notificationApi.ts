import { authenticatedRequest } from '../api/http';

export type AppNotification = {
  id: string;
  type: string;
  orderId: string | null;
  orderNumber: string | null;
  orderStatus: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
};

type NotificationResponse = {
  id: string;
  type: string;
  orderId: string | null;
  orderNumber: string | null;
  orderStatus: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
};

function mapNotification(notification: NotificationResponse): AppNotification {
  return {
    id: notification.id,
    type: notification.type,
    orderId: notification.orderId,
    orderNumber: notification.orderNumber,
    orderStatus: notification.orderStatus,
    read: notification.read,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
  };
}

export async function fetchNotifications(accessToken: string) {
  const payload = await authenticatedRequest<NotificationResponse[]>(accessToken, '/api/v1/notifications', {
    method: 'GET',
  });

  return payload.map(mapNotification);
}

export async function markNotificationAsRead(accessToken: string, notificationId: string) {
  const payload = await authenticatedRequest<NotificationResponse>(
    accessToken,
    `/api/v1/notifications/${notificationId}/read`,
    { method: 'POST' },
  );

  return mapNotification(payload);
}

export async function markAllNotificationsAsRead(accessToken: string) {
  await authenticatedRequest<void>(accessToken, '/api/v1/notifications/read-all', {
    method: 'POST',
  });
}
