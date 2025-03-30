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
});