import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { 
  Bell,
  Trophy,
  Award,
  Clock,
  Users,
  MessageSquare,
  Info,
  Save,
  ArrowLeft
} from "lucide-react-native";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  
  // Notification settings state
  const [settings, setSettings] = useState({
    // Challenge notifications
    challengeInvites: true,
    challengeUpdates: true,
    challengeReminders: true,
    challengeCompletions: true,
    
    // Achievement notifications
    achievementUnlocked: true,
    achievementProgress: true,
    
    // Social notifications
    friendActivity: true,
    mentions: true,
    messages: true,
    
    // System notifications
    systemAnnouncements: true,
    appUpdates: false,
    
    // Push notification settings
    pushEnabled: true,
    emailEnabled: true,
  });
  const toggleSetting = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const saveSettings = () => {
    // In a real app, this would save to the backend
    Alert.alert(
      "Settings Saved",
      "Your notification preferences have been updated.",
      [{ text: "OK" }]
    );
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Notification Settings",
          headerBackTitle: "Notifications"
        }} 
      />
      
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={settings.pushEnabled}
                onValueChange={() => toggleSetting('pushEnabled')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.pushEnabled ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MessageSquare size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Email Notifications</Text>
              </View>
              <Switch
                value={settings.emailEnabled}
                onValueChange={() => toggleSetting('emailEnabled')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.emailEnabled ? colors.primary : colors.border}
              />
            </View>
          </Card>
          
          <Text style={styles.sectionTitle}>Challenge Notifications</Text>
          
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Challenge Invitations</Text>
              </View>
              <Switch
                value={settings.challengeInvites}
                onValueChange={() => toggleSetting('challengeInvites')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.challengeInvites ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Trophy size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Challenge Updates</Text>
              </View>
              <Switch
                value={settings.challengeUpdates}
                onValueChange={() => toggleSetting('challengeUpdates')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.challengeUpdates ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Clock size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Daily Reminders</Text>
              </View>
              <Switch
                value={settings.challengeReminders}
                onValueChange={() => toggleSetting('challengeReminders')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.challengeReminders ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Trophy size={20} color={colors.success} />
                <Text style={styles.settingLabel}>Challenge Completions</Text>
              </View>
              <Switch
                value={settings.challengeCompletions}
                onValueChange={() => toggleSetting('challengeCompletions')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.challengeCompletions ? colors.primary : colors.border}
              />
            </View>
          </Card>
          
          <Text style={styles.sectionTitle}>Achievement Notifications</Text>
          
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Award size={20} color={colors.secondary} />
                <Text style={styles.settingLabel}>Achievements Unlocked</Text>
              </View>
              <Switch
                value={settings.achievementUnlocked}
                onValueChange={() => toggleSetting('achievementUnlocked')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.achievementUnlocked ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Award size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Achievement Progress</Text>
              </View>
              <Switch
                value={settings.achievementProgress}
                onValueChange={() => toggleSetting('achievementProgress')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.achievementProgress ? colors.primary : colors.border}
              />
            </View>
          </Card>
          
          <Text style={styles.sectionTitle}>Social Notifications</Text>
          
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Friend Activity</Text>
              </View>
              <Switch
                value={settings.friendActivity}
                onValueChange={() => toggleSetting('friendActivity')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.friendActivity ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MessageSquare size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Mentions</Text>
              </View>
              <Switch
                value={settings.mentions}
                onValueChange={() => toggleSetting('mentions')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.mentions ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MessageSquare size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>Direct Messages</Text>
              </View>
              <Switch
                value={settings.messages}
                onValueChange={() => toggleSetting('messages')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.messages ? colors.primary : colors.border}
              />
            </View>
          </Card>
          
          <Text style={styles.sectionTitle}>System Notifications</Text>
          
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Info size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>System Announcements</Text>
              </View>
              <Switch
                value={settings.systemAnnouncements}
                onValueChange={() => toggleSetting('systemAnnouncements')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.systemAnnouncements ? colors.primary : colors.border}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Info size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>App Updates</Text>
              </View>
              <Switch
                value={settings.appUpdates}
                onValueChange={() => toggleSetting('appUpdates')}
                trackColor={{ false: colors.inactive, true: `${colors.primary}80` }}
                thumbColor={settings.appUpdates ? colors.primary : colors.border}
              />
            </View>
          </Card>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Save Settings"
              onPress={saveSettings}
              icon={<Save size={18} color={colors.background} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    marginVertical: 24,
  },
});