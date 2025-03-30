import React, { useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useChallengeStore } from "@/store/challengeStore";
import { useAuthStore } from "@/store/authStore";
import { ChallengeCard } from "@/components/ChallengeCard";
import { EmptyState } from "@/components/EmptyState";
import { HealthDataCard } from "@/components/HealthDataCard";
import { colors } from "@/constants/colors";
import { 
  Trophy, 
  TrendingUp, 
  Plus,
  ArrowRight
} from "lucide-react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    challenges, 
    userChallenges, 
    fetchChallenges, 
    isLoading 
  } = useChallengeStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      // In a real app, we would redirect to login
      // For now, we'll create a mock user
      useAuthStore.getState().login({
        id: "user-1",
        username: "Sarah Johnson",
        email: "sarah@example.com",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        balance: 500,
        createdAt: new Date().toISOString()
      });
    }
    
    fetchChallenges();
  }, []);
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  }, []);
  
  // Filter active challenges for the current user
  const activeChallenges = challenges.filter(
    challenge => userChallenges.includes(challenge.id)
  );
  
  // Get trending challenges (not joined by user)
  const trendingChallenges = challenges
    .filter(challenge => !userChallenges.includes(challenge.id))
    .slice(0, 3);
  
  const navigateToCreateChallenge = () => {
    router.push("/create");
  };
  
  const navigateToAllChallenges = () => {
    router.push("/challenges");
  };
  
  // Check if user has any fitness challenges
  const hasFitnessChallenges = activeChallenges.some(
    challenge => challenge.category === "fitness"
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.username?.split(" ")[0] || "there"}!
          </Text>
          <View style={styles.balanceContainer}>
            <Trophy size={16} color={colors.secondary} />
            <Text style={styles.balance}>{user?.balance || 0} coins</Text>
          </View>
        </View>
        
        {/* Health Data Card - only show if user has fitness challenges */}
        {hasFitnessChallenges && (
          <HealthDataCard />
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Active Challenges</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllChallenges}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {activeChallenges.length > 0 ? (
            activeChallenges.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
              />
            ))
          ) : (
            <EmptyState
              title="No Active Challenges"
              message="Join or create a challenge to get started on your goals!"
              icon={<Trophy size={48} color={colors.primary} />}
              actionLabel="Create Challenge"
              onAction={navigateToCreateChallenge}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Challenges</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllChallenges}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {trendingChallenges.length > 0 ? (
            trendingChallenges.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                showProgress={false}
              />
            ))
          ) : (
            <EmptyState
              title="No Trending Challenges"
              message="Be the first to create a challenge!"
              icon={<TrendingUp size={48} color={colors.primary} />}
              actionLabel="Create Challenge"
              onAction={navigateToCreateChallenge}
            />
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={navigateToCreateChallenge}
        >
          <Plus size={20} color={colors.background} />
          <Text style={styles.createButtonText}>Create New Challenge</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  balance: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.background,
  },
});