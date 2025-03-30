import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Activity, 
  Heart, 
  Moon, 
  Footprints, 
  Ruler, 
  Scale,
  Calendar,
  ChevronRight,
  RefreshCw
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { HealthDataCard } from '@/components/HealthDataCard';
import { healthService, HealthMetric } from '@/services/healthService';

export default function HealthDashboardScreen() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('today'); // 'today', 'week', 'month'

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Get permissions to determine what data we can fetch
      const permissions = healthService.getPermissions();
      const grantedPermissions = permissions.filter(p => p.granted);
      
      if (grantedPermissions.length === 0) {
        setHealthData([]);
        return;
      }
      
      // Fetch data for each granted permission
      const allData: HealthMetric[] = [];
      
      for (const permission of grantedPermissions) {
        try {
          const data = await healthService.getHealthData(permission.id);
          allData.push(...data);
        } catch (error) {
          console.error(`Error fetching ${permission.name} data:`, error);
        }
      }
      
      setHealthData(allData);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHealthData();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthData();
  };

  // Change date range
  const changeDateRange = (range: string) => {
    setDateRange(range);
    fetchHealthData();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Health Dashboard',
          headerBackTitle: 'Health'
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                dateRange === 'today' && styles.dateRangeButtonActive
              ]}
              onPress={() => changeDateRange('today')}
            >
              <Text style={[
                styles.dateRangeText,
                dateRange === 'today' && styles.dateRangeTextActive
              ]}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                dateRange === 'week' && styles.dateRangeButtonActive
              ]}
              onPress={() => changeDateRange('week')}
            >
              <Text style={[
                styles.dateRangeText,
                dateRange === 'week' && styles.dateRangeTextActive
              ]}>Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                dateRange === 'month' && styles.dateRangeButtonActive
              ]}
              onPress={() => changeDateRange('month')}
            >
              <Text style={[
                styles.dateRangeText,
                dateRange === 'month' && styles.dateRangeTextActive
              ]}>Month</Text>
            </TouchableOpacity>
          </View>
          
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading health data...</Text>
            </View>
          ) : healthData.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Health Data Available</Text>
              <Text style={styles.emptyText}>
                Connect your health services to see your data here.
              </Text>
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => router.push('/health/connect')}
              >
                <Text style={styles.connectButtonText}>Connect Health Services</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Activity</Text>
              
              {healthData.filter(data => 
                data.name === 'Steps' || 
                data.name.includes('Distance') || 
                data.name.includes('Energy')
              ).map(metric => (
                <HealthDataCard 
                  key={metric.id}
                  metric={metric}
                  icon={
                    metric.name === 'Steps' ? 
                      <Footprints size={24} color={colors.primary} /> :
                    metric.name.includes('Distance') ?
                      <Activity size={24} color={colors.primary} /> :
                      <Activity size={24} color={colors.secondary} />
                  }
                />
              ))}
              
              <Text style={styles.sectionTitle}>Vitals</Text>
              
              {healthData.filter(data => 
                data.name.includes('Heart') || 
                data.name.includes('Sleep') ||
                data.name.includes('Weight')
              ).map(metric => (
                <HealthDataCard 
                  key={metric.id}
                  metric={metric}
                  icon={
                    metric.name.includes('Heart') ? 
                      <Heart size={24} color={colors.error} /> :
                    metric.name.includes('Sleep') ?
                      <Moon size={24} color={colors.primary} /> :
                      <Scale size={24} color={colors.primary} />
                  }
                />
              ))}
              
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/health/metrics')}
              >
                <Text style={styles.viewAllText}>View All Health Metrics</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Connected Challenges</Text>
              
              <Card style={styles.challengesCard}>
                <TouchableOpacity
                  style={styles.challengeItem}
                  onPress={() => router.push('/challenge/1')}
                >
                  <View style={styles.challengeInfo}>
                    <Footprints size={20} color={colors.primary} />
                    <View>
                      <Text style={styles.challengeName}>10K Steps Daily</Text>
                      <Text style={styles.challengeProgress}>Progress: 8,432 / 10,000 steps</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.challengeItem, styles.noBorder]}
                  onPress={() => router.push('/challenge/3')}
                >
                  <View style={styles.challengeInfo}>
                    <Activity size={20} color={colors.primary} />
                    <View>
                      <Text style={styles.challengeName}>Weekly 5K Run</Text>
                      <Text style={styles.challengeProgress}>Progress: 3.2 / 5.0 km</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </Card>
              
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/challenges/health')}
              >
                <Text style={styles.viewAllText}>View All Health Challenges</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
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
  dateRangeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 4,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  dateRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dateRangeTextActive: {
    color: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: colors.background,
    fontWeight: '500',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    padding: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  challengesCard: {
    marginBottom: 16,
  },
  challengeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  challengeProgress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});