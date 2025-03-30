import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Trophy,
  Award,
  Footprints
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from './Card';
import { Avatar } from './Avatar';

// Types for social feed
export type PostType = 'challenge_joined' | 'challenge_completed' | 'progress_update' | 'achievement_unlocked';

export type SocialPost = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: PostType;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
  challengeId?: string;
  challengeName?: string;
  achievementId?: string;
  achievementName?: string;
  media?: string;
};

type SocialFeedProps = {
  posts: SocialPost[];
  loading?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onChallengePress?: (challengeId: string) => void;
  onAchievementPress?: (achievementId: string) => void;
  onMorePress?: (postId: string) => void;
  limit?: number;
};

export function SocialFeed({
  posts,
  loading = false,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onChallengePress,
  onAchievementPress,
  onMorePress,
  limit
}: SocialFeedProps) {
  const router = useRouter();
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Get icon for post type
  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case 'challenge_joined':
        return <Trophy size={16} color={colors.primary} />;
      case 'challenge_completed':
        return <Trophy size={16} color={colors.success} />;
      case 'progress_update':
        return <Footprints size={16} color={colors.primary} />;
      case 'achievement_unlocked':
        return <Award size={16} color={colors.secondary} />;
      default:
        return null;
    }
  };

  // Handle user press
  const handleUserPress = (userId: string) => {
    if (onUserPress) {
      onUserPress(userId);
    } else {
      router.push(`/profile/${userId}`);
    }
  };

  // Handle challenge press
  const handleChallengePress = (challengeId: string) => {
    if (onChallengePress) {
      onChallengePress(challengeId);
    } else {
      router.push(`/challenge/${challengeId}`);
    }
  };

  // Handle achievement press
  const handleAchievementPress = (achievementId: string) => {
    if (onAchievementPress) {
      onAchievementPress(achievementId);
    } else {
      router.push(`/achievements/${achievementId}`);
    }
  };

  // Handle like press
  const handleLikePress = (postId: string) => {
    if (onLike) {
      onLike(postId);
    }
  };

  // Handle comment press
  const handleCommentPress = (postId: string) => {
    if (onComment) {
      onComment(postId);
    } else {
      router.push(`/comments/${postId}`);
    }
  };

  // Handle share press
  const handleSharePress = (postId: string) => {
    if (onShare) {
      onShare(postId);
    }
  };

  // Handle more press
  const handleMorePress = (postId: string) => {
    if (onMorePress) {
      onMorePress(postId);
    }
  };

  // Render post item
  const renderPostItem = ({ item }: { item: SocialPost }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => handleUserPress(item.userId)}
        >
          <Avatar 
            source={item.userAvatar} 
            size={40} 
          />
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <View style={styles.postTypeContainer}>
              {getPostTypeIcon(item.type)}
              <Text style={styles.postType}>
                {item.type === 'challenge_joined' && 'Joined a challenge'}
                {item.type === 'challenge_completed' && 'Completed a challenge'}
                {item.type === 'progress_update' && 'Posted an update'}
                {item.type === 'achievement_unlocked' && 'Unlocked an achievement'}
                {' • '}
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMorePress(item.id)}
        >
          <MoreHorizontal size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.challengeId && (
        <TouchableOpacity
          style={styles.challengeTag}
          onPress={() => handleChallengePress(item.challengeId!)}
        >
          <Trophy size={14} color={colors.primary} />
          <Text style={styles.challengeName}>{item.challengeName}</Text>
        </TouchableOpacity>
      )}
      
      {item.achievementId && (
        <TouchableOpacity
          style={styles.achievementTag}
          onPress={() => handleAchievementPress(item.achievementId!)}
        >
          <Award size={14} color={colors.secondary} />
          <Text style={styles.achievementName}>{item.achievementName}</Text>
        </TouchableOpacity>
      )}
      
      {item.media && (
        <Image 
          source={{ uri: item.media }} 
          style={styles.postMedia}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.postStats}>
        <Text style={styles.statsText}>
          {item.likes} likes • {item.comments} comments
        </Text>
      </View>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikePress(item.id)}
        >
          <Heart 
            size={20} 
            color={item.liked ? colors.error : colors.textSecondary}
            fill={item.liked ? colors.error : 'none'}
          />
          <Text 
            style={[
              styles.actionText,
              item.liked && styles.actionTextActive
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCommentPress(item.id)}
        >
          <MessageSquare size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSharePress(item.id)}
        >
          <Share2 size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // If loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  // If no posts, show empty state
  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Posts Found</Text>
        <Text style={styles.emptyText}>
          Follow friends or join challenges to see posts here.
        </Text>
      </View>
    );
  }

  // Limit posts if needed
  const displayPosts = limit ? posts.slice(0, limit) : posts;

  return (
    <FlatList
      data={displayPosts}
      renderItem={renderPostItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Parent should handle scrolling
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 8,
  },
  postCard: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  postTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  postType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  challengeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  challengeName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  achievementTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondary,
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionTextActive: {
    color: colors.error,
  },
});