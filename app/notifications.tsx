import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  TouchableOpacity,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationItem } from "@/components/NotificationItem";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/constants/colors";
import { 
  Bell,
  CheckCheck,
  Trash2,
  Settings
} from "lucide-react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    clearNotifications
  } = useNotificationStore();
  
  // Add some mock notifications if there are none
  useEffect(() => {
    if (notifications.length === 0) {
      // Add mock notifications for demonstration
      const mockNotifications = [
        {
          id: "notification-1",
          userId: "user-1",
          title: "Challenge Completed",
          message: "Congratulations! You've completed the '10,000 Steps Daily' challenge.",
          type: "challenge",
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          data: { challengeId: "challenge-1" }
        },
        {
          id: "notification-2",
          userId: "user-1",
          title: "Achievement Unlocked",
          message: "You've earned the 'First Steps' achievement by joining your first challenge!",
          type: "achievement",
          read: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          data: { achievementId: "achievement-1" }
        },
        {
          id: "notification-3",
          userId: "user-1",
          title: "New Challenge Invitation",
          message: "Mike Chen has invited you to join the 'No Social Media' challenge.",
          type: "challenge",
          read: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          data: { challengeId: "challenge-4" }
        }
      ];
      
      mockNotifications.forEach(notification => {
        useNotificationStore.getState().addNotification(notification);
      });
    }
  }, []);
  
  const handleNotificationPress = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === "challenge" && notification.data?.challengeId) {
      router.push(`/challenge/${notification.data.challengeId}`);
    } else if (notification.type === "achievement") {
      router.push("/profile");
    }
  };
  
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert("Info", "No unread notifications");
      return;
    }
    
    markAllAsRead();
  };
  
  const handleClearAll = () => {
    if (notifications.length === 0) {
      Alert.alert("Info", "No notifications to clear");
      return;
    }
    
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to clear all notifications?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearNotifications
        }
      ]
    );
  };
  
  const navigateToSettings = () => {
    router.push("/notifications/settings");
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Notifications",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleMarkAllAsRead}
              >
                <CheckCheck size={20} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleClearAll}
              >
                <Trash2 size={20} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={navigateToSettings}
              >
                <Settings size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotificationItem
                notification={item}
                onPress={() => handleNotificationPress(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            title="No Notifications"
            message="You don't have any notifications yet. Stay tuned for updates on your challenges and achievements!"
            icon={<Bell size={48} color={colors.primary} />}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});