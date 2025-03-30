import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: `notification-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
          ...notification
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      },
      
      markAsRead: (notificationId) => {
        set((state) => {
          const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
          if (notificationIndex === -1) return state;
          
          const wasUnread = !state.notifications[notificationIndex].read;
          
          const updatedNotifications = [...state.notifications];
          updatedNotifications[notificationIndex] = {
            ...updatedNotifications[notificationIndex],
            read: true
          };
          
          return {
            notifications: updatedNotifications,
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      }
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);