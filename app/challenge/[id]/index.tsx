import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  Coins,
  ArrowRight,
  CheckCircle,
  XCircle,
  BarChart2,
  Camera,
  Award
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { useChallengeStore, Challenge } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/utils/dateUtils';
import { SkeletonCard } from '@/components/SkeletonLoader';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { challenges, joinChallenge, updateProgress } = useChallengeStore();
  const { user, updateBalance } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userProgress, setUserProgress] = useState(0);
  const [isParticipant, setIsParticipant] = useState(false);
  const [joiningChallenge, setJoiningChallenge] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  
  // Animation values
  const progressScale = useSharedValue(1);
  
  useEffect(() => {
    // Find the challenge
    const foundChallenge = challenges.find(c => c.id === id);
    if (foundChallenge) {
      setChallenge(foundChallenge);
      
      // Check if user is a participant
      if (user) {
        const participant = foundChallenge.participants.find(p => p.id === user.id);
        setIsParticipant(!!participant);
        
        if (participant) {
          setUserProgress(participant.progressPercentage);
        }
      }
    }
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [id, challenges, user?.id]);
  
  const handleJoinChallenge = () => {
    if (!challenge || !user) return;
    
    // Check if user has enough balance
    if (user.balance < challenge.stake) {
      Alert.alert(
        "Insufficient Balance",
        `You need ${challenge.stake} coins to join this challenge. Your current balance is ${user.balance} coins.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Confirm joining
    Alert.alert(
      "Join Challenge",
      `Are you sure you want to join this challenge? ${challenge.stake} coins will be deducted from your balance.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Join", 
          onPress: () => {
            setJoiningChallenge(true);
            
            // Deduct stake from user balance
            updateBalance(-challenge.stake);
            
            // Add user to challenge participants
            joinChallenge(challenge.id, {
              id: user.id,
              name: user.username || "Anonymous",
              avatar: user.avatar || ""
            });
            
            // Update state
            setIsParticipant(true);
            setUserProgress(0);
            
            setTimeout(() => {
              setJoiningChallenge(false);
              
              // Show success message
              Alert.alert(
                "Challenge Joined",
                "You have successfully joined the challenge!",
                [{ text: "OK" }]
              );
            }, 1000);
          }
        }
      ]
    );
  };
  
  const handleUpdateProgress = () => {
    if (!challenge || !isParticipant || !user) return;
    
    // For demo purposes, we'll just increment progress by a random amount
    // In a real app, this would be based on actual user activity or input
    setUpdatingProgress(true);
    
    // Calculate new progress (random increment between 5-20%)
    const increment = Math.floor(Math.random() * 16) + 5;
    const newProgress = Math.min(userProgress + increment, 100);
    
    // Animate progress
    progressScale.value = withSequence(
      withTiming(1.1, { duration: 300, easing: Easing.bounce }),
      withTiming(1, { duration: 300 })
    );
    
    // Update progress in store
    updateProgress(challenge.id, user.id, newProgress);
    
    // Update local state
    setUserProgress(newProgress);
    
    setTimeout(() => {
      setUpdatingProgress(false);
      
      // If progress is 100%, show completion message
      if (newProgress === 100) {
        Alert.alert(
          "Challenge Completed",
          "Congratulations! You've completed your part of the challenge. Wait for the challenge end date to receive your rewards.",
          [{ text: "OK" }]
        );
      }
    }, 1000);
  };
  
  const navigateToTrackProgress = () => {
    router.push(`/challenge/${id}/track-progress`);
  };
  
  const navigateToStats = () => {
    router.push(`/challenge/${id}/stats`);
  };
  
  const navigateToComplete = () => {
    router.push(`/challenge/${id}/complete`);
  };
  
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progressScale.value }]
    };
  });
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: "Challenge Details" }} />
        <SkeletonCard lines={5} style={styles.skeletonCard} />
        <SkeletonCard lines={3} style={styles.skeletonCard} />
        <SkeletonCard lines={2} style={styles.skeletonCard} />
      </SafeAreaView>
    );
  }
  
  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Challenge Not Found" }} />
        <Text style={styles.errorText}>Challenge not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  
  const isActive = new Date(challenge.startDate) <= new Date() && new Date(challenge.endDate) >= new Date();
  const isUpcoming = new Date(challenge.startDate) > new Date();
  const isExpired = new Date(challenge.endDate) < new Date();
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: challenge.title,
          headerTintColor: colors.primary
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <Animated.View 
          style={styles.challengeCard}
          entering={FadeInDown.duration(500)}
        >
          <Card>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeType}>
                {challenge.type === 'steps' && <Trophy size={24} color={colors.primary} />}
                {challenge.type === 'workout' && <Trophy size={24} color={colors.primary} />}
                {challenge.type === 'meditation' && <Trophy size={24} color={colors.primary} />}
                {challenge.type === 'reading' && <Trophy size={24} color={colors.primary} />}
                {challenge.type === 'custom' && <Trophy size={24} color={colors.primary} />}
                <Text style={styles.challengeTypeText}>
                  {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)} Challenge
                </Text>
              </View>
              
              {challenge.isCompleted ? (
                <View style={styles.statusBadge}>
                  <CheckCircle size={16} color={colors.background} />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              ) : isActive ? (
                <View style={[styles.statusBadge, styles.activeBadge]}>
                  <Clock size={16} color={colors.background} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              ) : isUpcoming ? (
                <View style={[styles.statusBadge, styles.upcomingBadge]}>
                  <Calendar size={16} color={colors.background} />
                  <Text style={styles.statusText}>Upcoming</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.expiredBadge]}>
                  <XCircle size={16} color={colors.background} />
                  <Text style={styles.statusText}>Expired</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            
            <View style={styles.challengeDetails}>
              <View style={styles.detailItem}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.detailText}>
                  {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Target size={20} color={colors.primary} />
                <Text style={styles.detailText}>
                  Goal: {challenge.goal} {challenge.goalUnit}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Coins size={20} color={colors.primary} />
                <Text style={styles.detailText}>
                  Stake: {challenge.stake} coins
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.detailText}>
                  Participants: {challenge.participants.length}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                {challenge.verificationType === 'automatic' && (
                  <>
                    <CheckCircle size={20} color={colors.primary} />
                    <Text style={styles.detailText}>
                      Verification: Automatic
                    </Text>
                  </>
                )}
                {challenge.verificationType === 'photo' && (
                  <>
                    <Camera size={20} color={colors.primary} />
                    <Text style={styles.detailText}>
                      Verification: Photo proof
                    </Text>
                  </>
                )}
                {challenge.verificationType === 'honor' && (
                  <>
                    <Award size={20} color={colors.primary} />
                    <Text style={styles.detailText}>
                      Verification: Honor system
                    </Text>
                  </>
                )}
              </View>
            </View>
            
            {isParticipant && (
              <Animated.View style={[styles.progressContainer, progressAnimatedStyle]}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  <Text style={styles.progressPercentage}>{userProgress}%</Text>
                </View>
                <ProgressBar 
                  progress={userProgress / 100}
                  total={1}
                  color={userProgress === 100 ? colors.success : colors.primary}
                />
                {userProgress === 100 && (
                  <Text style={styles.completedText}>
                    You've completed this challenge!
                  </Text>
                )}
              </Animated.View>
            )}
          </Card>
        </Animated.View>
        
        <Animated.View 
          style={styles.participantsCard}
          entering={SlideInRight.delay(300).duration(500)}
        >
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.sectionCount}>{challenge.participants.length}</Text>
            </View>
            
            {challenge.participants.length > 0 ? (
              <>
                {challenge.participants.slice(0, 5).map((participant) => (
                  <View key={participant.id} style={styles.participantItem}>
                    <View style={styles.participantAvatar}>
                      <Avatar 
                        name={participant.name}
                        source={participant.avatar}
                        size={40}
                      />
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant.name}
                        {user && participant.id === user.id && " (You)"}
                      </Text>
                      <View style={styles.participantProgress}>
                        <ProgressBar 
                          progress={participant.progressPercentage / 100}
                          total={1}
                          height={6}
                        />
                      </View>
                    </View>
                    <Text style={styles.participantPercentage}>
                      {participant.progressPercentage}%
                    </Text>
                  </View>
                ))}
                
                {challenge.participants.length > 5 && (
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={navigateToStats}
                  >
                    <Text style={styles.viewAllText}>
                      View All Participants
                    </Text>
                    <ArrowRight size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.noParticipantsText}>
                No participants yet. Be the first to join!
              </Text>
            )}
          </Card>
        </Animated.View>
        
        <View style={styles.buttonContainer}>
          {!isParticipant && !challenge.isCompleted && (
            <Button
              title="Join Challenge"
              onPress={handleJoinChallenge}
              loading={joiningChallenge}
              disabled={joiningChallenge || isExpired}
              icon={<Trophy size={18} color="#FFFFFF" />}
            />
          )}
          
          {isParticipant && isActive && !challenge.isCompleted && (
            <>
              <Button
                title={userProgress === 100 ? "Update Progress" : "Track Progress"}
                onPress={navigateToTrackProgress}
                variant="primary"
                icon={<Target size={18} color="#FFFFFF" />}
              />
              
              <Button
                title="Quick Update"
                onPress={handleUpdateProgress}
                variant="secondary"
                loading={updatingProgress}
                disabled={updatingProgress}
                style={styles.secondaryButton}
                icon={<ArrowRight size={18} color="#FFFFFF" />}
              />
            </>
          )}
          
          <Button
            title="View Statistics"
            onPress={navigateToStats}
            variant={isParticipant ? "outline" : "secondary"}
            style={styles.statsButton}
            icon={<BarChart2 size={18} color={isParticipant ? colors.primary : "#FFFFFF"} />}
          />
          
          {isParticipant && isExpired && !challenge.isCompleted && (
            <Button
              title="Complete Challenge"
              onPress={navigateToComplete}
              variant="primary"
              style={styles.completeButton}
              icon={<CheckCircle size={18} color="#FFFFFF" />}
            />
          )}
          
          {challenge.isCompleted && (
            <Button
              title="View Results"
              onPress={navigateToComplete}
              variant="primary"
              icon={<Trophy size={18} color="#FFFFFF" />}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  skeletonCard: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  challengeCard: {
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  activeBadge: {
    backgroundColor: colors.primary,
  },
  upcomingBadge: {
    backgroundColor: colors.secondary,
  },
  expiredBadge: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  challengeDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  challengeDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  progressContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  completedText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  participantsCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  participantProgress: {
    height: 6,
  },
  participantPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  noParticipantsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  buttonContainer: {
    marginVertical: 24,
  },
  secondaryButton: {
    marginTop: 12,
  },
  statsButton: {
    marginTop: 12,
  },
  completeButton: {
    marginTop: 12,
  },
});