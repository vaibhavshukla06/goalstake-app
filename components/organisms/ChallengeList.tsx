import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useChallenges } from '@/utils/hooks/useChallenges';
import { ChallengeCard } from '../molecules/ChallengeCard';
import { SuspenseWrapper } from '../SuspenseWrapper';
import { useComponentPerformance } from '@/utils/performance';
import { Challenge } from '@/types';
import SkeletonLoader from '../SkeletonLoader';

type ChallengeListProps = {
  userId?: string;
  category?: string;
};

// Actual component that does the data fetching
function ChallengeListContent({ userId, category }: ChallengeListProps) {
  // Track performance
  useComponentPerformance('ChallengeList');
  
  // Get challenges data through React Query
  const { useChallengesQuery } = useChallenges();
  const { data: challenges } = useChallengesQuery({
    suspense: true, // Enable suspense mode
  });
  
  // Filter challenges if needed
  const filteredChallenges = React.useMemo(() => {
    if (!challenges) return [];
    
    let result = [...challenges];
    
    if (userId) {
      result = result.filter(challenge => 
        challenge.participants.some((p: {userId: string}) => p.userId === userId));
    }
    
    if (category) {
      result = result.filter(challenge => challenge.category === category);
    }
    
    return result;
  }, [challenges, userId, category]);

  // Empty state
  if (!filteredChallenges.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No challenges found</Text>
      </View>
    );
  }

  // Render the list of challenges
  return (
    <FlatList
      data={filteredChallenges}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChallengeCard challenge={item} />}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

// Export the wrapped component with Suspense and ErrorBoundary
export function ChallengeList(props: ChallengeListProps) {
  // Custom fallback UI for loading state
  const fallback = (
    <View style={styles.container}>
      <SkeletonLoader type="challenge-list" count={3} />
    </View>
  );
  
  return (
    <SuspenseWrapper fallback={fallback}>
      <ChallengeListContent {...props} />
    </SuspenseWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 