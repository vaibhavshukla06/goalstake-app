import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Trophy,
  Award,
  Footprints,
  Filter
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';

// Types for social feed
type PostType = 'challenge_joined' | 'challenge_completed' | 'progress_update' | 'achievement_unlocked';

type SocialPost = {
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

// Mock data for social feed
const mockSocialFeed: SocialPost[] = [
  {
    id: '1',
    userId: '101',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'challenge_completed',
    content: 'Just completed my 30-day meditation challenge! Feeling so much more centered and focused.',
    timestamp: '2023-03-17T14:30:00Z',
    likes: 24,
    comments: 5,
    liked: true,
    challengeId: '201',
    challengeName: '30-Day Meditation Challenge',
  },
  {
    id: '2',
    userId: '102',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'progress_update',
    content: 'Day 15 of my 10K steps challenge! Already feeling more energetic.',
    timestamp: '2023-03-17T12:15:00Z',
    likes: 18,
    comments: 3,
    liked: false,
    challengeId: '202',
    challengeName: '10K Steps Daily',
    media: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '3',
    userId: '103',
    userName: 'Emily Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'achievement_unlocked',
    content: 'Just unlocked the "Early Bird" achievement! 5 days of morning workouts completed.',
    timestamp: '2023-03-17T09:45:00Z',
    likes: 32,
    comments: 7,
    liked: true,
    achievementId: '301',
    achievementName: 'Early Bird',
  },
  {
    id: '4',
    userId: '104',
    userName: 'David Kim',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'challenge_joined',
    content: 'Just joined the "Read 12 Books in 2023" challenge! Who else is in?',
    timestamp: '2023-03-16T22:10:00Z',
    likes: 15,
    comments: 8,
    liked: false,
    challengeId: '203',
    challengeName: 'Read 12 Books in 2023',
  },
  {
    id: '5',
    userId: '105',
    userName: 'Jessica Taylor',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'progress_update',
    content: 'Halfway through my "Learn Spanish" challenge! Can now have basic conversations.',
    timestamp: '2023-03-16T18:30:00Z',
    likes: 27,
    comments: 12,
    liked: true,
    challengeId: '204',
    challengeName: 'Learn Spanish in 90 Days',
  },
  {
    id: '6',
    userId: '106',
    userName: 'Alex Washington',
    userAvatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'achievement_unlocked',
    content: 'Just earned the "Consistency King" badge! 30 days straight of goal tracking.',
    timestamp: '2023-03-16T16:45:00Z',
    likes: 41,
    comments: 9,
    liked: false,
    achievementId: '302',
    achievementName: 'Consistency King',
  },
  {
    id: '7',
    userId: '107',
    userName: 'Olivia Martinez',
    userAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    type: 'challenge_completed',
    content: 'Finished the "No Sugar for 30 Days" challenge! Feeling amazing and lost 5 pounds!',
    timestamp: '2023-03-16T14:20:00Z',
    likes: 53,
    comments: 15,
    liked: true,
    challengeId: '205',
    challengeName: 'No Sugar for 30 Days',
    media: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
  },
];

export default function SocialFeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockSocialFeed);
      setLoading(false);
    };

    loadPosts();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPosts(mockSocialFeed);
    setRefreshing(false);
  };

  // Toggle like
  const toggleLike = (postId: string) => {
    setPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  // Filter posts
  const filterPosts = (type: string | null) => {
    setActiveFilter(type);
  };

  // Get filtered posts
  const getFilteredPosts = () => {
    if (!activeFilter) return posts;
    return posts.filter(post => post.type === activeFilter);
  };

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

  // Render post item
  const renderPostItem = ({ item }: { item: SocialPost }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${item.userId}`)}
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
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.challengeId && (
        <TouchableOpacity
          style={styles.challengeTag}
          onPress={() => router.push(`/challenge/${item.challengeId}`)}
        >
          <Trophy size={14} color={colors.primary} />
          <Text style={styles.challengeName}>{item.challengeName}</Text>
        </TouchableOpacity>
      )}
      
      {item.achievementId && (
        <TouchableOpacity
          style={styles.achievementTag}
          onPress={() => router.push(`/achievements/${item.achievementId}`)}
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
          onPress={() => toggleLike(item.id)}
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
          onPress={() => router.push(`/comments/${item.id}`)}
        >
          <MessageSquare size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Social Feed',
          headerRight: () => (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {/* Show filter modal */}}
            >
              <Filter size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.filterContainer}>
          <ScrollableFilter 
            activeFilter={activeFilter}
            onFilterChange={filterPosts}
          />
        </View>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading social feed...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredPosts()}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Posts Found</Text>
                <Text style={styles.emptyText}>
                  {activeFilter 
                    ? `No ${activeFilter.replace('_', ' ')} posts available.`
                    : 'Follow friends or join challenges to see posts here.'}
                </Text>
                {activeFilter && (
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={() => setActiveFilter(null)}
                  >
                    <Text style={styles.clearFilterText}>Clear Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

// Scrollable filter component
function ScrollableFilter({ 
  activeFilter, 
  onFilterChange 
}: { 
  activeFilter: string | null, 
  onFilterChange: (filter: string | null) => void 
}) {
  const filters = [
    { id: null, label: 'All' },
    { id: 'challenge_joined', label: 'Joined' },
    { id: 'challenge_completed', label: 'Completed' },
    { id: 'progress_update', label: 'Updates' },
    { id: 'achievement_unlocked', label: 'Achievements' },
  ];

  return (
    <FlatList
      horizontal
      data={filters}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === item.id && styles.filterChipActive
          ]}
          onPress={() => onFilterChange(item.id)}
        >
          <Text style={[
            styles.filterChipText,
            activeFilter === item.id && styles.filterChipTextActive
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id || 'all'}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterList}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    marginBottom: 16,
  },
  clearFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearFilterText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
});