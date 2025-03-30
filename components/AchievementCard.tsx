import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Achievement } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/dateUtils';
import { Award, Lock } from 'lucide-react-native';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  unlocked
}) => {
  return (
    <Card style={[
      styles.card,
      !unlocked && styles.lockedCard
    ]}>
      <View style={styles.content}>
        <View style={[
          styles.iconContainer,
          !unlocked && styles.lockedIconContainer
        ]}>
          {unlocked ? (
            <Award size={24} color={colors.primary} />
          ) : (
            <Lock size={20} color={colors.inactive} />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            !unlocked && styles.lockedTitle
          ]}>
            {achievement.title}
          </Text>
          
          <Text style={[
            styles.description,
            !unlocked && styles.lockedDescription
          ]}>
            {achievement.description}
          </Text>
          
          {unlocked && achievement.unlockedAt && (
            <Text style={styles.date}>
              Unlocked on {formatDate(achievement.unlockedAt)}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  lockedCard: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIconContainer: {
    backgroundColor: colors.border,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  lockedTitle: {
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  lockedDescription: {
    color: colors.inactive,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});