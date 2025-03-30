import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { Trophy,
  Award,
  Users,
  Calendar,
  CheckCircle,
  Coins,
  ArrowRight
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/dateUtils';
import { useNotificationStore } from '@/store/notificationStore';
import { useAchievementStore } from '@/store/achievementStore';

export default function ChallengeCompleteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { challenges, completeChallenge } = useChallengeStore();
  const { user, updateUserBalance } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { unlockAchievement } = useAchievementStore();
  
  const [challenge, setChallenge] = useState(null);
  const [winners, setWinners] = useState([]);
  const [userIsWinner, setUserIsWinner] = useState(false);
  const [userReward, setUserReward] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Find the challenge
    const foundChallenge = challenges.find(c => c.id === id);
    if (foundChallenge) {
      setChallenge(foundChallenge);
      
      // If challenge is already completed, get winners
      if (foundChallenge.isCompleted) {
        setWinners(foundChallenge.winners || []);
        setUserIsWinner(foundChallenge.winners?.some(w => w.id === user.id) || false);
        
        // Calculate user reward if they're a winner
        const userWinner = foundChallenge.winners?.find(w => w.id === user.id);
        if (userWinner) {
          setUserReward(userWinner.reward || 0);
        }
      } else {
        // Calculate potential winners based on progress
        const completedParticipants = foundChallenge.participants.filter(
          p => p.progressPercentage === 100
        );
        
        setWinners(completedParticipants);
        setUserIsWinner(completedParticipants.some(p => p.id === user.id));
        
        // Calculate potential reward
        if (completedParticipants.length > 0) {
          const totalStake = foundChallenge.stake * foundChallenge.participants.length;
          const rewardPerWinner = Math.floor(totalStake / completedParticipants.length);
          setUserReward(rewardPerWinner);
        }
      }
    }
  }, [id, challenges, user.id]);
  
  const handleCompleteChallenge = () => {
    if (!challenge) return;
    
    // Check if challenge can be completed
    const today = new Date();
    const endDate = new Date(challenge.endDate);
    
    if (today < endDate) {
      Alert.alert(
        "Cannot Complete Yet",
        `This challenge will end on ${formatDate(challenge.endDate)}. Please wait until the end date to complete it.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Confirm completion
    Alert.alert(
      "Complete Challenge",
      "Are you sure you want to complete this challenge? This will distribute rewards to all participants who completed the challenge.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Complete", 
          onPress: () => {
            setIsProcessing(true);
            
            // Calculate winners and rewards
            const completedParticipants = challenge.participants.filter(
              p => p.progressPercentage === 100
            );
            
            const totalStake = challenge.stake * challenge.participants.length;
            const rewardPerWinner = completedParticipants.length > 0
              ? Math.floor(totalStake / completedParticipants.length)
              : 0;
            
            const winnersWithRewards = completedParticipants.map(p => ({
              ...p,
              reward: rewardPerWinner
            }));
            
            // Update challenge in store
            completeChallenge(challenge.id, winnersWithRewards);
            
            // If user is a winner, update their balance
            const isUserWinner = completedParticipants.some(p => p.id === user.id);
            if (isUserWinner) {
              updateUserBalance(rewardPerWinner);
              
              // Add notification
              addNotification({
                id: Date.now().toString(),
                title: "Challenge Reward",
                message: `You've received ${rewardPerWinner} coins for completing the "${challenge.title}" challenge!`,
                type: "achievement",
                read: false,
                createdAt: new Date().toISOString()
              });
              
              // Unlock achievement
              unlockAchievement("challenge_completed");
            }
            
            // Add notification for challenge completion
            addNotification({
              id: (Date.now() + 1).toString(),
              title: "Challenge Completed",
              message: `The "${challenge.title}" challenge has been completed with ${completedParticipants.length} winners!`,
              type: "challenge",
              read: false,
              createdAt: new Date().toISOString()
            });
            
            setTimeout(() => {
              setIsProcessing(false);
              
              // Refresh challenge data
              const updatedChallenge = challenges.find(c => c.id === id);
              if (updatedChallenge) {
                setChallenge(updatedChallenge);
                setWinners(updatedChallenge.winners || []);
                setUserIsWinner(updatedChallenge.winners?.some(w => w.id === user.id) || false);
              }
              
              // Show success message
              Alert.alert(
                "Challenge Completed",
                "The challenge has been successfully completed and rewards have been distributed!",
                [{ text: "OK" }]
              );
            }, 1500);
          }
        }
      ]
    );
  };
  
  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Challenge Results" }} />
        <Text style={styles.errorText}>Challenge not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  
  const isExpired = new Date(challenge.endDate) < new Date();
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: challenge.isCompleted ? "Challenge Results" : "Complete Challenge" }} />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.summaryCard}>
          <View style={styles.challengeHeader}>
            <Trophy size={32} color={colors.primary} />
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            {challenge.isCompleted ? (
              <View style={styles.completedBadge}>
                <CheckCircle size={20} color={colors.background} />
                <Text style={styles.completedText}>Challenge Completed</Text>
              </View>
            ) : isExpired ? (
              <View style={styles.expiredBadge}>
                <Calendar size={20} color={colors.background} />
                <Text style={styles.completedText}>Challenge Ended</Text>
              </View>
            ) : (
              <View style={styles.activeBadge}>
                <Calendar size={20} color={colors.background} />
                <Text style={styles.completedText}>Challenge Active</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {challenge.participants.length} Participants
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Coins size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {challenge.stake} Coins Stake
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Trophy size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {winners.length} Winners
              </Text>
            </View>
          </View>
        </Card>
        
        {challenge.isCompleted && userIsWinner && (
          <Card style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Award size={32} color={colors.success} />
              <Text style={styles.rewardTitle}>Congratulations!</Text>
            </View>
            
            <Text style={styles.rewardDescription}>
              You've successfully completed this challenge and earned a reward!
            </Text>
            
            <View style={styles.rewardAmount}>
              <Coins size={24} color={colors.success} />
              <Text style={styles.rewardValue}>{userReward} Coins</Text>
            </View>
          </Card>
        )}
        
        <Card style={styles.winnersCard}>
          <Text style={styles.winnersTitle}>
            {challenge.isCompleted ? "Winners" : "Potential Winners"}
          </Text>
          
          {winners.length > 0 ? (
            <>
              {winners.map((winner) => (
                <View key={winner.id} style={styles.winnerItem}>
                  <Avatar 
                    uri={winner.avatar} 
                    size={40} 
                    style={styles.winnerAvatar}
                  />
                  
                  <View style={styles.winnerInfo}>
                    <Text style={styles.winnerName}>
                      {winner.name}
                      {winner.id === user.id && " (You)"}
                    </Text>
                    
                    {challenge.isCompleted && (
                      <View style={styles.winnerReward}>
                        <Coins size={14} color={colors.success} />
                        <Text style={styles.winnerRewardText}>
                          {winner.reward} Coins
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Trophy size={16} color={colors.success} />
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.noWinnersText}>
              No participants have completed this challenge yet.
            </Text>
          )}
        </Card>
        
        {!challenge.isCompleted && isExpired && (
          <Button
            title="Complete Challenge"
            onPress={handleCompleteChallenge}
            loading={isProcessing}
            disabled={isProcessing}
            icon={<CheckCircle size={18} color={colors.background} />}
            style={styles.completeButton}
          />
        )}
        
        <Button
          title="Back to Challenge"
          onPress={() => router.push(`/challenge/${id}`)}
          variant="outline"
          icon={<ArrowRight size={18} color={colors.primary} />}
          style={styles.backButton}
        />
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
  summaryCard: {
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  statusContainer: {
    marginBottom: 16,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  detailsContainer: {
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
  rewardCard: {
    marginBottom: 16,
    backgroundColor: `${colors.success}10`,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 12,
  },
  rewardDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  rewardAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
  },
  winnersCard: {
    marginBottom: 24,
  },
  winnersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  winnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  winnerAvatar: {
    marginRight: 12,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  winnerReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  winnerRewardText: {
    fontSize: 14,
    color: colors.success,
  },
  noWinnersText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  completeButton: {
    marginBottom: 12,
  },
  backButton: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
  },
});