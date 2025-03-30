import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { 
  BarChart2, 
  Users, 
  Trophy, 
  Medal, 
  Clock, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

export default function ChallengeStatsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { challenges } = useChallengeStore();
  const { user } = useAuthStore();
  
  const [challenge, setChallenge] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [sortBy, setSortBy] = useState('progress'); // 'progress', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [stats, setStats] = useState({
    averageProgress: 0,
    completedCount: 0,
    userRank: 0,
    daysLeft: 0
  });
  
  useEffect(() => {
    // Find the challenge
    const foundChallenge = challenges.find(c => c.id === id);
    if (foundChallenge) {
      setChallenge(foundChallenge);
      
      // Sort participants
      sortParticipants(foundChallenge.participants, sortBy, sortOrder);
      
      // Calculate stats
      calculateStats(foundChallenge);
    }
  }, [id, challenges, sortBy, sortOrder]);
  
  const sortParticipants = (participantList, by, order) => {
    const sorted = [...participantList].sort((a, b) => {
      if (by === 'progress') {
        return order === 'desc' 
          ? b.progressPercentage - a.progressPercentage
          : a.progressPercentage - b.progressPercentage;
      } else if (by === 'name') {
        return order === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      return 0;
    });
    
    setParticipants(sorted);
  };
  
  const calculateStats = (challengeData) => {
    if (!challengeData) return;
    
    // Calculate average progress
    const totalProgress = challengeData.participants.reduce(
      (sum, p) => sum + p.progressPercentage, 
      0
    );
    const averageProgress = challengeData.participants.length > 0
      ? Math.round(totalProgress / challengeData.participants.length)
      : 0;
    
    // Count completed participants
    const completedCount = challengeData.participants.filter(
      p => p.progressPercentage === 100
    ).length;
    
    // Calculate user's rank
    const sortedByProgress = [...challengeData.participants].sort(
      (a, b) => b.progressPercentage - a.progressPercentage
    );
    const userIndex = sortedByProgress.findIndex(p => p.id === user.id);
    const userRank = userIndex !== -1 ? userIndex + 1 : 0;
    
    // Calculate days left
    const endDate = new Date(challengeData.endDate);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    
    setStats({
      averageProgress,
      completedCount,
      userRank,
      daysLeft
    });
  };
  
  const toggleSort = (by) => {
    if (sortBy === by) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(by);
      setSortOrder('desc');
    }
  };
  
  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Challenge Statistics" }} />
        <Text style={styles.errorText}>Challenge not found</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Challenge Statistics" }} />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <BarChart2 size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Challenge Overview</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.statValue}>{challenge.participants.length}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            
            <View style={styles.statItem}>
              <Trophy size={20} color={colors.primary} />
              <Text style={styles.statValue}>{stats.completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Medal size={20} color={colors.primary} />
              <Text style={styles.statValue}>
                {stats.userRank > 0 ? `#${stats.userRank}` : '-'}
              </Text>
              <Text style={styles.statLabel}>Your Rank</Text>
            </View>
            
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.statValue}>{stats.daysLeft}</Text>
              <Text style={styles.statLabel}>Days Left</Text>
            </View>
          </View>
          
          <View style={styles.averageContainer}>
            <View style={styles.averageHeader}>
              <Text style={styles.averageTitle}>Average Progress</Text>
              <Text style={styles.averageValue}>{stats.averageProgress}%</Text>
            </View>
            <ProgressBar 
              progress={stats.averageProgress / 100}
              color={colors.secondary}
            />
          </View>
        </Card>
        
        <Card style={styles.leaderboardCard}>
          <View style={styles.cardHeader}>
            <Trophy size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Leaderboard</Text>
          </View>
          
          <View style={styles.sortHeader}>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => toggleSort('name')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'name' && styles.sortButtonActive
              ]}>
                Name
              </Text>
              {sortBy === 'name' && (
                sortOrder === 'asc' ? 
                <ChevronUp size={16} color={colors.primary} /> : 
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => toggleSort('progress')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'progress' && styles.sortButtonActive
              ]}>
                Progress
              </Text>
              {sortBy === 'progress' && (
                sortOrder === 'asc' ? 
                <ChevronUp size={16} color={colors.primary} /> : 
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          {participants.map((participant, index) => (
            <View 
              key={participant.id} 
              style={[
                styles.participantItem,
                participant.id === user.id && styles.currentUserItem
              ]}
            >
              <Text style={styles.rankNumber}>#{index + 1}</Text>
              
              <Avatar 
                uri={participant.avatar} 
                size={36} 
                style={styles.participantAvatar}
              />
              
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {participant.name}
                  {participant.id === user.id && " (You)"}
                </Text>
                
                <View style={styles.progressContainer}>
                  <ProgressBar 
                    progress={participant.progressPercentage / 100}
                    color={participant.progressPercentage === 100 ? colors.success : colors.primary}
                    style={styles.participantProgress}
                  />
                  <Text style={styles.progressText}>
                    {participant.progressPercentage}%
                  </Text>
                </View>
              </View>
              
              {participant.progressPercentage === 100 && (
                <Trophy size={16} color={colors.success} style={styles.completedIcon} />
              )}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  averageContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  averageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  averageTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  averageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  leaderboardCard: {
    marginBottom: 24,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  sortButtonActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentUserItem: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  rankNumber: {
    width: 36,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  participantAvatar: {
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantProgress: {
    flex: 1,
    height: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
    width: 40,
  },
  completedIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
  },
});