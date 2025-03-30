import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors } from '@/constants/colors';

// Use conditional import for Reanimated to avoid web issues
let Animated;
if (Platform.OS !== 'web') {
  Animated = require('react-native-reanimated');
} else {
  // Simple fallback for web
  Animated = {
    View: View,
    createAnimatedComponent: (component) => component,
  };
}

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  // For web, we'll just use a static view
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.skeleton,
          { width, height, borderRadius, opacity: 0.5 },
          style
        ]}
      />
    );
  }
  
  // For native platforms, use Reanimated
  const { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } = Animated;
  
  const opacity = useSharedValue(0.3);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );
    
    return () => {
      cancelAnimation(opacity);
    };
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    };
  });
  
  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style
      ]}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  style
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={14}
          style={{ marginTop: 12 }}
        />
      ))}
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  style
}) => {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
};

// Challenge list skeleton
export const SkeletonChallengeList: React.FC<SkeletonListProps> = ({
  count = 3,
  style
}) => {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Skeleton width={80} height={24} borderRadius={12} />
            <Skeleton width={60} height={24} borderRadius={4} />
          </View>
          <Skeleton width="90%" height={20} style={{ marginTop: 12 }} />
          <Skeleton width="70%" height={16} style={{ marginTop: 8 }} />
          <View style={styles.challengeMeta}>
            <Skeleton width={80} height={12} />
            <Skeleton width={80} height={12} />
          </View>
          <Skeleton width="100%" height={8} style={{ marginTop: 16, marginBottom: 4 }} />
          <View style={styles.challengeActions}>
            <Skeleton width="45%" height={36} borderRadius={8} />
            <Skeleton width="45%" height={36} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );
};

// Profile skeleton
export const SkeletonProfile: React.FC<{style?: ViewStyle}> = ({ style }) => {
  return (
    <View style={[styles.profile, style]}>
      <Skeleton width={80} height={80} borderRadius={40} style={styles.avatar} />
      <Skeleton width={150} height={24} style={{ marginTop: 16 }} />
      <Skeleton width={100} height={16} style={{ marginTop: 8 }} />
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Skeleton width={50} height={24} />
          <Skeleton width={80} height={16} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={50} height={24} />
          <Skeleton width={80} height={16} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={50} height={24} />
          <Skeleton width={80} height={16} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
};

// Main SkeletonLoader component with different types
interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'challenge-list' | 'profile';
  count?: number;
  style?: ViewStyle;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 3,
  style
}) => {
  switch (type) {
    case 'card':
      return <SkeletonCard style={style} />;
    case 'list':
      return <SkeletonList count={count} style={style} />;
    case 'challenge-list':
      return <SkeletonChallengeList count={count} style={style} />;
    case 'profile':
      return <SkeletonProfile style={style} />;
    default:
      return <SkeletonCard style={style} />;
  }
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.cardBackground || colors.card || '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  list: {
    width: '100%',
  },
  challengeCard: {
    backgroundColor: colors.cardBackground || colors.card || '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  profile: {
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    alignSelf: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
});

export default SkeletonLoader;