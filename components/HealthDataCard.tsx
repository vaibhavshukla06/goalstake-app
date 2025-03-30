import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from './Card';
import { HealthMetric } from '@/services/healthService';

type HealthDataCardProps = {
  metric: HealthMetric;
  icon: React.ReactNode;
  onPress?: () => void;
};

export function HealthDataCard({ metric, icon, onPress }: HealthDataCardProps) {
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format value based on unit
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'steps':
        return value.toLocaleString();
      case 'km':
      case 'mi':
        return value.toFixed(1);
      case 'kcal':
        return value.toLocaleString();
      case 'bpm':
        return value.toString();
      case 'hours':
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${hours}h ${minutes}m`;
      default:
        return value.toString();
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.iconContainer}>
          {icon}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.metricName}>{metric.name}</Text>
            <Text style={styles.metricTime}>
              {formatDate(metric.date)}
            </Text>
          </View>
          
          <View style={styles.valueRow}>
            <Text style={styles.metricValue}>
              {formatValue(metric.value, metric.unit)}
              <Text style={styles.metricUnit}> {metric.unit}</Text>
            </Text>
            
            {onPress && (
              <ChevronRight size={16} color={colors.textSecondary} />
            )}
          </View>
          
          <Text style={styles.metricSource}>{metric.source}</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  metricTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  metricSource: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});