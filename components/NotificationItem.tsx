import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { formatTimeAgo } from '@/utils/dateUtils';
import { 
  Bell, 
  Award, 
  Target,
  Info
} from 'lucide-react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'challenge':
        return <Target size={20} color={colors.primary} />;
      case 'achievement':
        return <Award size={20} color={colors.secondary} />;
      case 'system':
      default:
        return <Info size={20} color={colors.textSecondary || colors.text} />;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        !notification.read && styles.unread
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>
          {formatTimeAgo(notification.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: {
    backgroundColor: `${colors.primary}08`,
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary || colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary || colors.text,
  },
});