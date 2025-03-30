import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Search,
  Filter,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  X
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';

// Types for leaderboard
type LeaderboardUser = {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  previousRank: number;
  completedChallenges: number;
  winRate: number;
};

// Mock data for leaderboard
const mockLeaderboardData: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 8750,
    rank: 1,
    previousRank: 2,
    completedChallenges: 42,
    winRate: 0.85,
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 8320,
    rank: 2,
    previousRank: 1,
    completedChallenges: 38,
    winRate: 0.82,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 7950,
    rank: 3,
    previousRank: 3,
    completedChallenges: 35,
    winRate: 0.79,
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 7680,
    rank: 4,
    previousRank: 6,
    completedChallenges: 32,
    winRate: 0.75,
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 7520,
    rank: 5,
    previousRank: 4,
    completedChallenges: 30,
    winRate: 0.73,
  },
  {
    id: '6',
    name: 'Alex Washington',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 7350,
    rank: 6,
    previousRank: 5,
    completedChallenges: 28,
    winRate: 0.71,
  },
  {
    id: '7',
    name: 'Olivia Martinez',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 7120,
    rank: 7,
    previousRank: 7,
    completedChallenges: 26,
    winRate: 0.68,
  },
  {
    id: '8',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6980,
    rank: 8,
    previousRank: 9,
    completedChallenges: 24,
    winRate: 0.65,
  },
  {
    id: '9',
    name: 'Sophia Garcia',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6750,
    rank: 9,
    previousRank: 8,
    completedChallenges: 22,
    winRate: 0.62,
  },
  {
    id: '10',
    name: 'Daniel Brown',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6580,
    rank: 10,
    previousRank: 10,
    completedChallenges: 20,
    winRate: 0.60,
  },
  {
    id: '11',
    name: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6420,
    rank: 11,
    previousRank: 12,
    completedChallenges: 18,
    winRate: 0.58,
  },
  {
    id: '12',
    name: 'Noah Davis',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6280,
    rank: 12,
    previousRank: 11,
    completedChallenges: 17,
    winRate: 0.56,
  },
  {
    id: '13',
    name: 'Ava Miller',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6150,
    rank: 13,
    previousRank: 14,
    completedChallenges: 16,
    winRate: 0.54,
  },
  {
    id: '14',
    name: 'Liam Wilson',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 6020,
    rank: 14,
    previousRank: 13,
    completedChallenges: 15,
    winRate: 0.52,
  },
  {
    id: '15',
    name: 'Isabella Moore',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&q=80',
    points: 5890,
    rank: 15,
    previousRank: 15,
    completedChallenges: 14,
    winRate: 0.50,
  },
];

// Current user for highlighting
const currentUserId = '4'; // David Kim

export default function LeaderboardScreen() {
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [filteredData, setFilteredData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all-time'); // 'weekly', 'monthly', 'all-time'

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeaderboardData(mockLeaderboardData);
      setFilteredData(mockLeaderboardData);
      setLoading(false);
    };

    loadLeaderboard();
  }, []);

  // Filter leaderboard data when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = leaderboardData.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(leaderboardData);
    }
  }, [searchQuery, leaderboardData]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate rank changes
    const updatedData = mockLeaderboardData.map(user => ({
      ...user,
      previousRank: user.rank,
      rank: Math.max(1, Math.min(15, user.rank + Math.floor(Math.random() * 3) - 1)),
      points: user.points + Math.floor(Math.random() * 100),
    })).sort((a, b) => a.rank - b.rank);
    
    setLeaderboardData(updatedData);
    setFilteredData(updatedData);
    setRefreshing(false);
  };

  // Toggle search bar
  const toggleSearch = () => {
    if (showSearch) {
      setSearchQuery('');
    }
    setShowSearch(!showSearch);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Change time filter
  const changeTimeFilter = (filter: string) => {
    setTimeFilter(filter);
    // In a real app, this would fetch different data based on the time filter
  };

  // Get rank change indicator
  const getRankChangeIndicator = (user: LeaderboardUser) => {
    const rankDiff = user.previousRank - user.rank;
    
    if (rankDiff > 0) {
      return (
        <View style={styles.rankChangeUp}>
          <ArrowUp size={12} color={colors.success} />
          <Text style={styles.rankChangeTextUp}>{rankDiff}</Text>
        </View>
      );
    } else if (rankDiff < 0) {
      return (
        <View style={styles.rankChangeDown}>
          <ArrowDown size={12} color={colors.error} />
          <Text style={styles.rankChangeTextDown}>{Math.abs(rankDiff)}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.rankChangeSame}>
          <Minus size={12} color={colors.textSecondary} />
        </View>
      );
    }
  };

  // Render leaderboard item
  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardUser, index: number }) => {
    const isCurrentUser = item.id === currentUserId;
    const isTopThree = item.rank <= 3;
    
    return (
      <TouchableOpacity
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem
        ]}
        onPress={() => router.push(`/profile/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View style={[
              styles.topRankBadge,
              item.rank === 1 && styles.firstRankBadge,
              item.rank === 2 && styles.secondRankBadge,
              item.rank === 3 && styles.thirdRankBadge,
            ]}>
              <Text style={styles.topRankText}>{item.rank}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
          {getRankChangeIndicator(item)}
        </View>
        
        <View style={styles.userContainer}>
          <Avatar source={item.avatar} size={40} />
          <View style={styles.userInfo}>
            <Text style={[
              styles.userName,
              isCurrentUser && styles.currentUserText
            ]}>
              {item.name}
              {isCurrentUser && ' (You)'}
            </Text>
            <Text style={styles.userStats}>
              {item.completedChallenges} challenges • {Math.round(item.winRate * 100)}% win rate
            </Text>
          </View>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={[
            styles.pointsText,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.points.toLocaleString()}
          </Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render header with time filter
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.timeFilterContainer}>
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === 'weekly' && styles.timeFilterButtonActive
          ]}
          onPress={() => changeTimeFilter('weekly')}
        >
          <Text style={[
            styles.timeFilterText,
            timeFilter === 'weekly' && styles.timeFilterTextActive
          ]}>Weekly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === 'monthly' && styles.timeFilterButtonActive
          ]}
          onPress={() => changeTimeFilter('monthly')}
        >
          <Text style={[
            styles.timeFilterText,
            timeFilter === 'monthly' && styles.timeFilterTextActive
          ]}>Monthly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFilterButton,
            timeFilter === 'all-time' && styles.timeFilterButtonActive
          ]}
          onPress={() => changeTimeFilter('all-time')}
        >
          <Text style={[
            styles.timeFilterText,
            timeFilter === 'all-time' && styles.timeFilterTextActive
          ]}>All Time</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.leaderboardHeader}>
        <Text style={styles.headerRank}>Rank</Text>
        <Text style={styles.headerUser}>User</Text>
        <Text style={styles.headerPoints}>Points</Text>
      </View>
    </View>
  );

  // Find current user in leaderboard
  const currentUser = leaderboardData.find(user => user.id === currentUserId);

  return (
    <>
      <Stack.Screen 
        options={{
          title: showSearch ? '' : 'Leaderboard',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleSearch}
              >
                {showSearch ? (
                  <X size={20} color={colors.text} />
                ) : (
                  <Search size={20} color={colors.text} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {/* Show filter modal */}}
              >
                <Filter size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: showSearch ? () => (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSearch}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : undefined
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : (
          <>
            {currentUser && (
              <Card style={styles.currentUserCard}>
                <View style={styles.currentUserHeader}>
                  <Text style={styles.currentUserTitle}>Your Ranking</Text>
                  <View style={styles.currentUserRank}>
                    <Trophy size={16} color={colors.primary} />
                    <Text style={styles.currentUserRankText}>
                      {currentUser.rank.toLocaleString()} of {leaderboardData.length.toLocaleString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.currentUserStats}>
                  <View style={styles.currentUserStatItem}>
                    <Text style={styles.currentUserStatValue}>
                      {currentUser.points.toLocaleString()}
                    </Text>
                    <Text style={styles.currentUserStatLabel}>Points</Text>
                  </View>
                  
                  <View style={styles.currentUserStatDivider} />
                  
                  <View style={styles.currentUserStatItem}>
                    <Text style={styles.currentUserStatValue}>
                      {currentUser.completedChallenges}
                    </Text>
                    <Text style={styles.currentUserStatLabel}>Challenges</Text>
                  </View>
                  
                  <View style={styles.currentUserStatDivider} />
                  
                  <View style={styles.currentUserStatItem}>
                    <Text style={styles.currentUserStatValue}>
                      {Math.round(currentUser.winRate * 100)}%
                    </Text>
                    <Text style={styles.currentUserStatLabel}>Win Rate</Text>
                  </View>
                </View>
                
                <View style={styles.rankChangeContainer}>
                  {getRankChangeIndicator(currentUser)}
                  <Text style={styles.rankChangeLabel}>
                    {currentUser.previousRank > currentUser.rank
                      ? `Up ${currentUser.previousRank - currentUser.rank} from last week`
                      : currentUser.previousRank < currentUser.rank
                      ? `Down ${currentUser.rank - currentUser.previousRank} from last week`
                      : 'No change from last week'}
                  </Text>
                </View>
              </Card>
            )}
            
            <FlatList
              data={filteredData}
              renderItem={renderLeaderboardItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={renderHeader}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={
                searchQuery ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No Users Found</Text>
                    <Text style={styles.emptyText}>
                      No users match your search for "{searchQuery}".
                    </Text>
                    <TouchableOpacity
                      style={styles.clearSearchButton}
                      onPress={clearSearch}
                    >
                      <Text style={styles.clearSearchText}>Clear Search</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          </>
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
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
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
  currentUserCard: {
    margin: 16,
    marginBottom: 8,
  },
  currentUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentUserTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currentUserRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentUserRankText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  currentUserStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentUserStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  currentUserStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  currentUserStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  currentUserStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  rankChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankChangeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerContainer: {
    paddingBottom: 8,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.cardBackground,
  },
  timeFilterButtonActive: {
    backgroundColor: colors.primary,
  },
  timeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  timeFilterTextActive: {
    color: colors.background,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRank: {
    width: 60,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  headerUser: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  headerPoints: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'right',
  },
  listContent: {
    paddingBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentUserItem: {
    backgroundColor: `${colors.primary}10`,
  },
  rankContainer: {
    width: 60,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  topRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  firstRankBadge: {
    backgroundColor: '#FFD700', // Gold
  },
  secondRankBadge: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdRankBadge: {
    backgroundColor: '#CD7F32', // Bronze
  },
  topRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  rankChangeUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rankChangeDown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rankChangeSame: {
    alignItems: 'center',
  },
  rankChangeTextUp: {
    fontSize: 12,
    color: colors.success,
  },
  rankChangeTextDown: {
    fontSize: 12,
    color: colors.error,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  currentUserText: {
    fontWeight: '600',
  },
  userStats: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pointsContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 12,
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
    marginBottom: 16,
  },
  clearSearchButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearSearchText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
});