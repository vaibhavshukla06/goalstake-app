import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: () => void;
  showActions?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onPress,
  showActions = true,
}) => {
  // Calculate days remaining
  const daysRemaining = React.useMemo(() => {
    const endDate = new Date(challenge.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [challenge.endDate]);

  // Calculate progress percentage
  const progressPercentage = React.useMemo(() => {
    if (challenge.participants.length === 0) return 0;
    
    const completedCount = challenge.participants.filter(p => p.isCompleted).length;
    return (completedCount / challenge.participants.length) * 100;
  }, [challenge.participants]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <Card>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{challenge.category}</Text>
          </View>
          <Text style={styles.stake}>${challenge.stake}</Text>
        </View>

        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>

        <View style={styles.metadata}>
          <Text style={styles.metaItem}>
            {challenge.participants.length} participant{challenge.participants.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.metaItem}>
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercentage)}% completed</Text>
        </View>

        {showActions && (
          <View style={styles.actions}>
            <Button
              title="View Details"
              size="small"
              variant="outline"
              onPress={onPress}
            />
            <Button
              title="Join Challenge"
              size="small"
              onPress={() => {
                // Handle join challenge
              }}
            />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'capitalize',
  },
  stake: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
}); 