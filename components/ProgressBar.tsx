import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  total: number;
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  height = 8,
  showPercentage = false,
  color = colors.primary,
  backgroundColor = colors.border,
  label
}) => {
  const percentage = Math.min(Math.max((progress / total) * 100, 0), 100);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View 
          style={[
            styles.progress, 
            { 
              width: `${percentage}%`,
              height,
              backgroundColor: color
            }
          ]} 
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>
          {Math.round(percentage)}% ({progress}/{total})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  track: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  }
});