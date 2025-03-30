import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { Avatar } from './Avatar';
import { Challenge } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate, getDaysRemaining } from '@/utils/dateUtils';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp,
  Target
} from 'lucide-react-native';

interface ChallengeCardProps {
  challenge: Challenge;
  showProgress?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  showProgress = true
}) => {
  const router = useRouter();
  
  const daysRemaining = getDaysRemaining(challenge.endDate);
  const participantCount = challenge.participants.length;
  
  // Get user progress if showProgress is true
  const userProgress = showProgress 
    ? challenge.participants[0]?.progress || 0 
    : 0;
  
  const handlePress = () => {
    router.push(`/challenge/${challenge.id}`);
  };
  
  const getCategoryIcon = () => {
    const category = challenge.category?.toString() || '';
    
    switch (category) {
      case 'fitness':
        return <TrendingUp key="fitness-icon" size={16} color={colors.primary} />;
      case 'learning':
        return <Target key="learning-icon" size={16} color={colors.primary} />;
      default:
        return <Target key="default-icon" size={16} color={colors.primary} />;
    }
  };
  
  // Format the category text safely
  const getCategoryText = () => {
    // Handle the case where category might be undefined or null
    const categoryString = challenge.category?.toString() || '';
    
    if (categoryString === '') {
      return 'General';
    }
    
    return categoryString.charAt(0).toUpperCase() + categoryString.slice(1);
  };

  // Helper function to handle avatar source
  const getAvatarSource = (avatar: any): string => {
    if (!avatar) return '';
    
    // If avatar is an object with a uri property (e.g., {uri: 'https://...'})
    if (typeof avatar === 'object' && avatar !== null && 'uri' in avatar) {
      return avatar.uri;
    }
    
    // If avatar is already a string
    if (typeof avatar === 'string') {
      return avatar;
    }
    
    return '';
  };
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Card>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            {getCategoryIcon()}
            <Text style={styles.categoryText}>
              {getCategoryText()}
            </Text>
          </View>
          <View style={styles.stakeBadge}>
            <Trophy size={14} color={colors.secondary} />
            <Text style={styles.stakeText}>{challenge.stake} coins</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {daysRemaining > 0 
                ? `${daysRemaining} days left` 
                : 'Ended'}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={userProgress} 
              total={challenge.target}
              showPercentage={true}
            />
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.avatarRow}>
            {challenge.participants.slice(0, 3).map((participant, index) => (
              <View 
                key={participant.userId || `participant-${index}`} 
                style={[styles.avatarContainer, { zIndex: 10 - index }]}
              >
                <Avatar 
                  source={getAvatarSource(participant.avatar)} 
                  name={participant.username} 
                  size={24} 
                  showBorder={true}
                />
              </View>
            ))}
            
            {participantCount > 3 && (
              <View style={styles.moreAvatars}>
                <Text style={styles.moreAvatarsText}>+{participantCount - 3}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.dateText}>
            Started {formatDate(challenge.startDate)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  stakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stakeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatarContainer: {
    marginRight: -8,
  },
  moreAvatars: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  moreAvatarsText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});