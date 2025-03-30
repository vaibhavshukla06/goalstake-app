import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/colors';
import { Target, Camera, Award, CheckCircle, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function TrackProgressScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { challenges, updateProgress } = useChallengeStore();
  const { user } = useAuthStore();
  
  const [challenge, setChallenge] = useState(null);
  const [userProgress, setUserProgress] = useState(0);
  const [newProgress, setNewProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  
  useEffect(() => {
    // Find the challenge
    const foundChallenge = challenges.find(c => c.id === id);
    if (foundChallenge) {
      setChallenge(foundChallenge);
      
      // Find user's progress
      const participant = foundChallenge.participants.find(p => p.id === user.id);
      if (participant) {
        setUserProgress(participant.progressPercentage);
        setNewProgress(participant.progressPercentage);
      }
    }
  }, [id, challenges, user.id]);
  
  const handleProgressUpdate = () => {
    if (!challenge) return;
    
    // Validate progress
    if (newProgress <= userProgress) {
      Alert.alert(
        "Invalid Progress",
        "New progress must be greater than current progress.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // For photo verification, check if image is uploaded
    if (challenge.verificationType === 'photo' && !proofImage) {
      Alert.alert(
        "Proof Required",
        "Please upload a photo as proof of your progress.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Confirm update
    Alert.alert(
      "Update Progress",
      `Are you sure you want to update your progress to ${newProgress}%?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: () => {
            setIsSubmitting(true);
            
            // Update progress in store
            updateProgress(challenge.id, user.id, newProgress);
            
            // Update local state
            setUserProgress(newProgress);
            
            setTimeout(() => {
              setIsSubmitting(false);
              
              // Show success message
              Alert.alert(
                "Progress Updated",
                "Your progress has been successfully updated!",
                [
                  { 
                    text: "OK", 
                    onPress: () => {
                      if (newProgress === 100) {
                        // If progress is 100%, show completion message
                        Alert.alert(
                          "Challenge Completed",
                          "Congratulations! You've completed your part of the challenge. Wait for the challenge end date to receive your rewards.",
                          [{ 
                            text: "OK",
                            onPress: () => router.back()
                          }]
                        );
                      } else {
                        router.back();
                      }
                    }
                  }
                ]
              );
            }, 1000);
          }
        }
      ]
    );
  };
  
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload photos!",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };
  
  const handleProgressIncrement = (amount) => {
    setNewProgress(Math.min(100, newProgress + amount));
  };
  
  const handleProgressDecrement = (amount) => {
    setNewProgress(Math.max(userProgress, newProgress - amount));
  };
  
  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Track Progress" }} />
        <Text style={styles.errorText}>Challenge not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Track Progress" }} />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Text style={styles.title}>Update Your Progress</Text>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Current Progress:</Text>
            <Text style={styles.progressValue}>{userProgress}%</Text>
          </View>
          
          <ProgressBar 
            progress={userProgress / 100}
            color={userProgress === 100 ? colors.success : colors.primary}
            style={styles.progressBar}
          />
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Set New Progress</Text>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>New Progress:</Text>
            <Text style={[
              styles.progressValue,
              newProgress > userProgress ? styles.progressIncreased : null
            ]}>
              {newProgress}%
            </Text>
          </View>
          
          <ProgressBar 
            progress={newProgress / 100}
            color={newProgress === 100 ? colors.success : colors.primary}
            style={styles.progressBar}
          />
          
          <View style={styles.progressControls}>
            <Button 
              title="-5%" 
              onPress={() => handleProgressDecrement(5)}
              variant="outline"
              style={styles.progressButton}
              disabled={newProgress <= userProgress}
            />
            <Button 
              title="-1%" 
              onPress={() => handleProgressDecrement(1)}
              variant="outline"
              style={styles.progressButton}
              disabled={newProgress <= userProgress}
            />
            <Button 
              title="+1%" 
              onPress={() => handleProgressIncrement(1)}
              variant="outline"
              style={styles.progressButton}
              disabled={newProgress >= 100}
            />
            <Button 
              title="+5%" 
              onPress={() => handleProgressIncrement(5)}
              variant="outline"
              style={styles.progressButton}
              disabled={newProgress >= 100}
            />
          </View>
          
          {challenge.verificationType === 'photo' && (
            <View style={styles.proofSection}>
              <Text style={styles.sectionTitle}>Upload Proof</Text>
              <Text style={styles.proofDescription}>
                Please upload a photo as proof of your progress.
              </Text>
              
              <Button 
                title={proofImage ? "Change Photo" : "Upload Photo"}
                onPress={pickImage}
                variant="secondary"
                icon={<Camera size={18} color={colors.secondary} />}
                style={styles.uploadButton}
              />
              
              {proofImage && (
                <View style={styles.imagePreviewContainer}>
                  {Platform.OS !== 'web' ? (
                    <Image 
                      source={{ uri: proofImage }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={styles.webImagePlaceholder}>
                      <CheckCircle size={24} color={colors.success} />
                      <Text style={styles.webImageText}>Photo selected</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          
          {challenge.verificationType === 'honor' && (
            <View style={styles.honorSection}>
              <Award size={24} color={colors.secondary} />
              <Text style={styles.honorText}>
                This challenge uses the honor system. Please be honest about your progress.
              </Text>
            </View>
          )}
        </Card>
        
        <Button
          title="Update Progress"
          onPress={handleProgressUpdate}
          loading={isSubmitting}
          disabled={isSubmitting || newProgress <= userProgress}
          icon={<Target size={18} color={colors.background} />}
          style={styles.submitButton}
        />
        
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
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
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: colors.text,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  progressIncreased: {
    color: colors.success,
  },
  progressBar: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  progressControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  progressButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  proofSection: {
    marginTop: 24,
  },
  proofDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  webImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
  },
  webImageText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.success,
  },
  honorSection: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}10`,
    padding: 16,
    borderRadius: 12,
  },
  honorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
  },
});