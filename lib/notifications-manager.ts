'use client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'price-alert' | 'new-property';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  priceAlerts: boolean;
  newListings: boolean;
  messages: boolean;
}

export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private subscriptions: Map<string, Set<(n: Notification) => void>> = new Map();

  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    expiresAt?: number
  ): Notification {
    const notification: Notification = {
      id: Math.random().toString(36).slice(7),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: Date.now(),
      expiresAt,
    };
    this.notifications.set(notification.id, notification);
    this.notifySubscribers(userId, notification);
    return notification;
  }

  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && (!unreadOnly || !n.read))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  deleteNotification(notificationId: string): boolean {
    return this.notifications.delete(notificationId);
  }

  setPreferences(userId: string, preferences: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.preferences.get(userId) || {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      priceAlerts: true,
      newListings: true,
      messages: true,
    };
    const updated = { ...current, ...preferences };
    this.preferences.set(userId, updated);
    return updated;
  }

  getPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      priceAlerts: true,
      newListings: true,
      messages: true,
    };
  }

  subscribe(userId: string, callback: (n: Notification) => void): () => void {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId)!.add(callback);

    return () => {
      this.subscriptions.get(userId)?.delete(callback);
    };
  }

  private notifySubscribers(userId: string, notification: Notification): void {
    const callbacks = this.subscriptions.get(userId);
    if (callbacks) {
      callbacks.forEach(callback => callback(notification));
    }
  }

  sendPriceAlert(userId: string, propertyTitle: string, oldPrice: number, newPrice: number): Notification {
    return this.createNotification(
      userId,
      'price-alert',
      'تنبيه تغير السعر',
      `السعر تغير من ${oldPrice} π إلى ${newPrice} π`,
      { propertyTitle, oldPrice, newPrice }
    );
  }

  sendNewListing(userId: string, propertyTitle: string, city: string): Notification {
    return this.createNotification(
      userId,
      'new-property',
      'عقار جديد',
      `عقار جديد في ${city}: ${propertyTitle}`,
      { propertyTitle, city }
    );
  }

  cleanExpiredNotifications(): void {
    const now = Date.now();
    for (const [id, notification] of this.notifications) {
      if (notification.expiresAt && now > notification.expiresAt) {
        this.notifications.delete(id);
      }
    }
  }
}

export function useNotifications(userId: string) {
  const manager = new NotificationManager();

  const createNotification = (type: NotificationType, title: string, message: string) => {
    return manager.createNotification(userId, type, title, message);
  };

  const getNotifications = (unreadOnly?: boolean) => {
    return manager.getNotifications(userId, unreadOnly);
  };

  const markAsRead = (notificationId: string) => {
    return manager.markAsRead(notificationId);
  };

  const setPreferences = (preferences: Partial<NotificationPreferences>) => {
    return manager.setPreferences(userId, preferences);
  };

  const subscribe = (callback: (n: Notification) => void) => {
    return manager.subscribe(userId, callback);
  };

  return {
    createNotification,
    getNotifications,
    markAsRead,
    setPreferences,
    subscribe,
    manager,
  };
}
