import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { SocialFeed, FeedItem } from '@/components/SocialFeed';
import { EmptyState } from '@/components/EmptyState';
import { useChallengeStore } from '@/store/challengeStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useAuthStore } from '@/store/authStore';
import { 
  Users, 
  Filter,
  Bell
} from 'lucide-react-native';

export default function SocialFeedScreen() {
  const router = useRouter();
  const { challenges } = useChallengeStore();
  const { achievements, unlockedAchievements } = useAchievementStore();
  const { user } = useAuthStore();
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'challenges' | 'achievements'>('all');
  
  useEffect(() => {
    generateFeedItems();
  }, [challenges, achievements, unlockedAchievements]);
  
  const generateFeedItems = () => {
    const items: FeedItem[] = [];
    
    // Generate feed items from challenges
    challenges.forEach(challenge => {
      // Challenge joined events
      challenge.participants.forEach(participant => {
        // Skip old events (more than 30 days)
        const joinDate = new Date(challenge.startDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 30) return;
        
        items.push({
          id: `join-${challenge.id}-${participant.userId}`,
          type: 'challenge_joined',
          userId: participant.userId,
          username: participant.username,
          userAvatar: participant.avatar,
          timestamp: challenge.startDate,
          likes: Math.floor(Math.random() * 10),
          comments: Math.floor(Math.random() * 5),
          liked: Math.random() > 0.7,
          data: {
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            message: `I've joined a new challenge: ${challenge.title}. Let's do this!`
          }
        });
      });
      
      // Challenge completed events
      challenge.participants
        .filter(p => p.isCompleted)
        .forEach(participant => {
          items.push({
            id: `complete-${challenge.id}-${participant.userId}`,
            type: 'challenge_completed',
            userId: participant.userId,
            username: participant.username,
            userAvatar: participant.avatar,
            timestamp: participant.lastUpdated,
            likes: Math.floor(Math.random() * 20) + 5,
            comments: Math.floor(Math.random() * 10),
            liked: Math.random() > 0.5,
            data: {
              challengeId: challenge.id,
              challengeTitle: challenge.title,
              message: `I've successfully completed the ${challenge.title} challenge! 🎉`
            }
          });
        });
    });
    
    // Generate feed items from achievements
    unlockedAchievements.forEach(achievementId => {
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement && achievement.unlockedAt && user) {
        items.push({
          id: `achievement-${achievementId}`,
          type: 'achievement_unlocked',
          userId: user.id,
          username: user.username,
          userAvatar: user.avatar,
          timestamp: achievement.unlockedAt,
          likes: Math.floor(Math.random() * 15) + 3,
          comments: Math.floor(Math.random() * 7),
          liked: false,
          data: {
            achievementId: achievement.id,
            achievementTitle: achievement.title,
            message: `I've unlocked the "${achievement.title}" achievement! ${achievement.description}`
          }
        });
      }
    });
    
    // Add some mock progress updates
    challenges.forEach(challenge => {
      if (challenge.participants.length > 0) {
        const randomParticipant = challenge.participants[Math.floor(Math.random() * challenge.participants.length)];
        
        // Only add progress updates for active challenges
        const endDate = new Date(challenge.endDate);
        const now = new Date();
        if (endDate < now) return;
        
        // Create a random date between start and now
        const startDate = new Date(challenge.startDate);
        const randomTimestamp = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
        
        items.push({
          id: `progress-${challenge.id}-${randomParticipant.userId}-${randomTimestamp.getTime()}`,
          type: 'progress_update',
          userId: randomParticipant.userId,
          username: randomParticipant.username,
          userAvatar: randomParticipant.avatar,
          timestamp: randomTimestamp.toISOString(),
          likes: Math.floor(Math.random() * 8),
          comments: Math.floor(Math.random() * 3),
          liked: Math.random() > 0.6,
          data: {
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            progressValue: Math.floor(Math.random() * 100) + 1,
            progressUnit: challenge.unit,
            message: `Making progress on my ${challenge.title} challenge! Feeling motivated!`,
            image: Math.random() > 0.7 ? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000' : undefined
          }
        });
      }
    });
    
    // Sort by timestamp (newest first)
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Filter items if needed
    let filteredItems = items;
    if (filter === 'challenges') {
      filteredItems = items.filter(item => 
        item.type === 'challenge_joined' || 
        item.type === 'challenge_completed' || 
        item.type === 'progress_update'
      );
    } else if (filter === 'achievements') {
      filteredItems = items.filter(item => item.type === 'achievement_unlocked');
    }
    
    setFeedItems(filteredItems);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    generateFeedItems();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleLike = (id: string) => {
    setFeedItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            liked: !item.liked,
            likes: item.liked ? item.likes - 1 : item.likes + 1
          };
        }
        return item;
      })
    );
  };
  
  const handleComment = (id: string) => {
    Alert.alert('Comment', 'Comment functionality would be implemented here');
  };
  
  const handleShare = (id: string) => {
    Alert.alert('Share', 'Share functionality would be implemented here');
  };
  
  const handleUserPress = (userId: string) => {
    // In a real app, navigate to user profile
    Alert.alert('User Profile', `Navigate to profile of user ${userId}`);
  };
  
  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Activity Feed',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'challenges' && styles.activeFilterButton
            ]}
            onPress={() => setFilter('challenges')}
          >
            <Text style={[
              styles.filterText,
              filter === 'challenges' && styles.activeFilterText
            ]}>
              Challenges
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'achievements' && styles.activeFilterButton
            ]}
            onPress={() => setFilter('achievements')}
          >
            <Text style={[
              styles.filterText,
              filter === 'achievements' && styles.activeFilterText
            ]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
        
        {feedItems.length > 0 ? (
          <SocialFeed
            items={feedItems}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onUserPress={handleUserPress}
            onChallengePress={handleChallengePress}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <EmptyState
            title="No Activity Yet"
            message="Join challenges, track progress, and earn achievements to see activity here."
            icon={<Users size={48} color={colors.primary} />}
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.background,
    fontWeight: '500',
  },
});