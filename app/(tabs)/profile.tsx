import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useChallengeStore } from "@/store/challengeStore";
import { useAchievementStore } from "@/store/achievementStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { AchievementCard } from "@/components/AchievementCard";
import { Button } from "@/components/Button";
import { colors } from "@/constants/colors";
import { 
  Trophy, 
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
  Bell,
  User,
  Shield,
  HelpCircle,
  Wallet,
  CreditCard,
  History
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { challenges, userChallenges } = useChallengeStore();
  const { achievements, unlockedAchievements, fetchAchievements } = useAchievementStore();
  const { notifications, unreadCount } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<"stats" | "achievements" | "wallet">("stats");
  
  useEffect(() => {
    fetchAchievements();
  }, []);
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Not Logged In</Text>
          <Button
            title="Log In"
            onPress={() => {
              // For demo purposes, create a mock user
              useAuthStore.getState().login({
                id: "user-1",
                username: "Sarah Johnson",
                email: "sarah@example.com",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                balance: 500,
                createdAt: new Date().toISOString()
              });
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // Calculate user stats
  const userParticipations = challenges.filter(challenge => 
    challenge.participants.some(p => p.userId === user.id)
  );
  
  const completedChallenges = userParticipations.filter(challenge => 
    challenge.participants.find(p => p.userId === user.id)?.isCompleted
  );
  
  const activeChallenges = userParticipations.filter(challenge => 
    !challenge.participants.find(p => p.userId === user.id)?.isCompleted
  );
  
  const createdChallenges = challenges.filter(challenge => 
    challenge.creatorId === user.id
  );
  
  // Mock transaction history
  const transactions = [
    {
      id: "tx-1",
      type: "stake",
      amount: -50,
      description: "Stake for 10,000 Steps Daily",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tx-2",
      type: "reward",
      amount: 100,
      description: "Reward for completing Daily Meditation",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tx-3",
      type: "deposit",
      amount: 200,
      description: "Account deposit",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => logout()
        }
      ]
    );
  };
  
  const navigateToNotifications = () => {
    router.push("/notifications");
  };
  
  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Trophy size={24} color={colors.primary} />
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Award size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Bell size={24} color={colors.primary} />
            <Text style={styles.statValue}>{activeChallenges.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Edit size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{createdChallenges.length}</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </Card>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <User size={20} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={navigateToNotifications}
        >
          <Bell size={20} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Shield size={20} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Privacy</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <HelpCircle size={20} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      {achievements.length > 0 ? (
        achievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedAchievements.includes(achievement.id)}
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Award size={48} color={colors.primary} />
          <Text style={styles.emptyText}>No achievements available yet</Text>
        </View>
      )}
    </View>
  );
  
  const renderWalletTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.walletCard}>
        <Text style={styles.walletTitle}>Your Balance</Text>
        <Text style={styles.walletBalance}>{user.balance} coins</Text>
        
        <View style={styles.walletActions}>
          <TouchableOpacity style={styles.walletAction}>
            <CreditCard size={20} color={colors.primary} />
            <Text style={styles.walletActionText}>Add Funds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.walletAction}>
            <Wallet size={20} color={colors.primary} />
            <Text style={styles.walletActionText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </Card>
      
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactions.map(transaction => (
          <Card key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionType}>
                {transaction.type === "stake" ? (
                  <Trophy size={16} color={colors.error} />
                ) : transaction.type === "reward" ? (
                  <Award size={16} color={colors.success} />
                ) : (
                  <Wallet size={16} color={colors.primary} />
                )}
                <Text style={[
                  styles.transactionTypeText,
                  transaction.type === "stake" ? styles.stakeText : 
                  transaction.type === "reward" ? styles.rewardText : 
                  styles.depositText
                ]}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </Text>
              </View>
              
              <Text style={[
                styles.transactionAmount,
                transaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount
              ]}>
                {transaction.amount > 0 ? "+" : ""}{transaction.amount} coins
              </Text>
            </View>
            
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
            
            <Text style={styles.transactionDate}>
              {formatDate(transaction.date)}
            </Text>
          </Card>
        ))}
        
        <TouchableOpacity style={styles.viewAllButton}>
          <History size={16} color={colors.primary} />
          <Text style={styles.viewAllText}>View All Transactions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Avatar 
              source={user.avatar} 
              name={user.username} 
              size={80}
              showBorder
            />
            
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
              
              <View style={styles.balanceContainer}>
                <Trophy size={16} color={colors.secondary} />
                <Text style={styles.balance}>{user.balance} coins</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "stats" && styles.activeTab
            ]}
            onPress={() => setActiveTab("stats")}
          >
            <Text style={[
              styles.tabText,
              activeTab === "stats" && styles.activeTabText
            ]}>
              Stats
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "achievements" && styles.activeTab
            ]}
            onPress={() => setActiveTab("achievements")}
          >
            <Text style={[
              styles.tabText,
              activeTab === "achievements" && styles.activeTabText
            ]}>
              Achievements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "wallet" && styles.activeTab
            ]}
            onPress={() => setActiveTab("wallet")}
          >
            <Text style={[
              styles.tabText,
              activeTab === "wallet" && styles.activeTabText
            ]}>
              Wallet
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === "stats" 
          ? renderStatsTab() 
          : activeTab === "achievements" 
          ? renderAchievementsTab()
          : renderWalletTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  balance: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    marginBottom: 12,
  },
  statContent: {
    alignItems: "center",
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  badgeContainer: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  logoutItem: {
    marginTop: 16,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: colors.error,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  walletCard: {
    marginBottom: 24,
    padding: 20,
  },
  walletTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  walletAction: {
    alignItems: "center",
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    width: "45%",
  },
  walletActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginTop: 8,
  },
  transactionSection: {
    marginBottom: 24,
  },
  transactionCard: {
    marginBottom: 12,
    padding: 16,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  stakeText: {
    color: colors.error,
  },
  rewardText: {
    color: colors.success,
  },
  depositText: {
    color: colors.primary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.error,
  },
  transactionDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
});