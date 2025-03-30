import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChallengeStore } from '@/store/challengeStore';
import { ChallengeCard } from '@/components/ChallengeCard';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { Plus } from 'lucide-react-native';

export default function ChallengesScreen() {
  const router = useRouter();
  const { challenges } = useChallengeStore();

  const navigateToChallenge = (id: string) => {
    router.push(`/challenge/${id}`);
  };

  const navigateToCreate = () => {
    router.push('/challenge/create');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'All Challenges',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.createButton}
              onPress={navigateToCreate}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />

      {challenges.length > 0 ? (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChallengeCard 
              challenge={item}
              onPress={() => navigateToChallenge(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          title="No Challenges Yet"
          message="Create your first challenge to get started"
          buttonTitle="Create Challenge"
          onPress={navigateToCreate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  createButton: {
    padding: 8,
  },
});