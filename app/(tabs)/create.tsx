import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useChallengeStore } from "@/store/challengeStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/Button";
import { colors } from "@/constants/colors";
import { ChallengeCategory, ChallengeType } from "@/types";
import { 
  Calendar,
  Trophy,
  Target,
  Users,
  Info,
  ChevronDown,
  Eye,
  EyeOff
} from "lucide-react-native";

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { createChallenge } = useChallengeStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChallengeCategory>(ChallengeCategory.Fitness);
  const [type, setType] = useState<ChallengeType>(ChallengeType.Accumulative);
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [stake, setStake] = useState("");
  const [duration, setDuration] = useState("7");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  const handleCreateChallenge = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a challenge");
      return;
    }
    
    if (!title || !description || !target || !unit || !stake || !duration) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    const stakeAmount = parseInt(stake);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      Alert.alert("Error", "Stake must be a positive number");
      return;
    }
    
    if (stakeAmount > user.balance) {
      Alert.alert("Error", "You don't have enough coins for this stake");
      return;
    }
    
    const targetValue = parseInt(target);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert("Error", "Target must be a positive number");
      return;
    }
    
    const durationDays = parseInt(duration);
    if (isNaN(durationDays) || durationDays <= 0) {
      Alert.alert("Error", "Duration must be a positive number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      
      const newChallenge = await createChallenge({
        title,
        description,
        category,
        type,
        target: targetValue,
        unit,
        stake: stakeAmount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isPublic
      });
      
      Alert.alert(
        "Success",
        "Challenge created successfully!",
        [
          {
            text: "View Challenge",
            onPress: () => router.push(`/challenge/${newChallenge.id}`)
          },
          {
            text: "OK",
            onPress: () => router.push("/")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create challenge");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderCategoryOption = (value: ChallengeCategory, label: string) => (
    <TouchableOpacity
      style={[
        styles.dropdownOption,
        category === value && styles.selectedDropdownOption
      ]}
      onPress={() => {
        setCategory(value);
        setShowCategoryDropdown(false);
      }}
    >
      <Text 
        style={[
          styles.dropdownOptionText,
          category === value && styles.selectedDropdownOptionText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderTypeOption = (value: ChallengeType, label: string, description: string) => (
    <TouchableOpacity
      style={[
        styles.dropdownOption,
        type === value && styles.selectedDropdownOption
      ]}
      onPress={() => {
        setType(value);
        setShowTypeDropdown(false);
      }}
    >
      <View>
        <Text 
          style={[
            styles.dropdownOptionText,
            type === value && styles.selectedDropdownOptionText
          ]}
        >
          {label}
        </Text>
        <Text style={styles.dropdownOptionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Create Challenge</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Challenge Title</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 10,000 Steps Daily"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your challenge..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={styles.dropdownText}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {renderCategoryOption(ChallengeCategory.Fitness, "Fitness")}
                {renderCategoryOption(ChallengeCategory.Learning, "Learning")}
                {renderCategoryOption(ChallengeCategory.Productivity, "Productivity")}
                {renderCategoryOption(ChallengeCategory.Health, "Health")}
                {renderCategoryOption(ChallengeCategory.Finance, "Finance")}
                {renderCategoryOption(ChallengeCategory.Other, "Other")}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Challenge Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text style={styles.dropdownText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {renderTypeOption(
                  ChallengeType.Accumulative, 
                  "Accumulative", 
                  "Add up progress over time (e.g., steps, pages read)"
                )}
                {renderTypeOption(
                  ChallengeType.Streak, 
                  "Streak", 
                  "Track consecutive days of activity"
                )}
                {renderTypeOption(
                  ChallengeType.Completion, 
                  "Completion", 
                  "Binary complete/incomplete goal"
                )}
              </View>
            )}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Target</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., 10000"
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., steps, pages"
                value={unit}
                onChangeText={setUnit}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Stake (coins)</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., 50"
                value={stake}
                onChangeText={setStake}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.helperText}>
                Your balance: {user?.balance || 0} coins
              </Text>
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Duration (days)</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., 7"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Visibility</Text>
            <View style={styles.visibilityContainer}>
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  isPublic && styles.selectedVisibilityOption
                ]}
                onPress={() => setIsPublic(true)}
              >
                <Eye size={18} color={isPublic ? colors.primary : colors.textSecondary} />
                <Text 
                  style={[
                    styles.visibilityText,
                    isPublic && styles.selectedVisibilityText
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  !isPublic && styles.selectedVisibilityOption
                ]}
                onPress={() => setIsPublic(false)}
              >
                <EyeOff size={18} color={!isPublic ? colors.primary : colors.textSecondary} />
                <Text 
                  style={[
                    styles.visibilityText,
                    !isPublic && styles.selectedVisibilityText
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <Info size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              By creating this challenge, you agree to stake {stake || "0"} coins. 
              You'll get them back (plus rewards) if you complete the challenge!
            </Text>
          </View>
          
          <Button
            title="Create Challenge"
            onPress={handleCreateChallenge}
            loading={isLoading}
            style={styles.createButton}
            icon={<Trophy size={18} color={colors.background} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownMenu: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedDropdownOption: {
    backgroundColor: `${colors.primary}10`,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedDropdownOptionText: {
    color: colors.primary,
    fontWeight: "500",
  },
  dropdownOptionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  visibilityContainer: {
    flexDirection: "row",
    gap: 12,
  },
  visibilityOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    flex: 1,
  },
  selectedVisibilityOption: {
    backgroundColor: `${colors.primary}15`,
  },
  visibilityText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  selectedVisibilityText: {
    color: colors.primary,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  createButton: {
    marginVertical: 24,
  },
});