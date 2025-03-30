import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Search,
  Filter,
  SlidersHorizontal,
  X
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { HealthDataCard } from '@/components/HealthDataCard';
import { healthService, HealthMetric } from '@/services/healthService';

export default function HealthMetricsScreen() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [filteredData, setFilteredData] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'activity', 'vitals'

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Get permissions to determine what data we can fetch
      const permissions = healthService.getPermissions();
      const grantedPermissions = permissions.filter(p => p.granted);
      
      if (grantedPermissions.length === 0) {
        setHealthData([]);
        setFilteredData([]);
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
      applyFilters(allData, searchQuery, activeFilter);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply filters to health data
  const applyFilters = (data: HealthMetric[], query: string, filter: string) => {
    let filtered = [...data];
    
    // Apply search query
    if (query) {
      filtered = filtered.filter(metric => 
        metric.name.toLowerCase().includes(query.toLowerCase()) ||
        metric.source.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filter !== 'all') {
      if (filter === 'activity') {
        filtered = filtered.filter(metric => 
          metric.name === 'Steps' || 
          metric.name.includes('Distance') || 
          metric.name.includes('Energy') ||
          metric.name.includes('Active')
        );
      } else if (filter === 'vitals') {
        filtered = filtered.filter(metric => 
          metric.name.includes('Heart') || 
          metric.name.includes('Sleep') ||
          metric.name.includes('Weight') ||
          metric.name.includes('Blood')
        );
      }
    }
    
    setFilteredData(filtered);
  };

  // Initial data fetch
  useEffect(() => {
    fetchHealthData();
  }, []);

  // Apply filters when search or filter changes
  useEffect(() => {
    applyFilters(healthData, searchQuery, activeFilter);
  }, [searchQuery, activeFilter]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthData();
  };

  // Toggle search bar
  const toggleSearch = () => {
    if (showSearch) {
      setSearchQuery('');
    }
    setShowSearch(!showSearch);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Set filter
  const setFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: showSearch ? '' : 'Health Metrics',
          headerBackTitle: 'Dashboard',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleSearch}
              >
                {showSearch ? (
                  <X size={20} color={colors.text} />
                ) : (
                  <Search size={20} color={colors.text} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {/* Show filter modal */}}
              >
                <SlidersHorizontal size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: showSearch ? () => (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search metrics..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSearch}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : undefined
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === 'all' && styles.filterTextActive
            ]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'activity' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('activity')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === 'activity' && styles.filterTextActive
            ]}>Activity</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'vitals' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('vitals')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === 'vitals' && styles.filterTextActive
            ]}>Vitals</Text>
          </TouchableOpacity>
        </View>
        
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
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading health data...</Text>
            </View>
          ) : filteredData.length === 0 ? (
            <View style={styles.emptyContainer}>
              {searchQuery ? (
                <>
                  <Text style={styles.emptyTitle}>No Results Found</Text>
                  <Text style={styles.emptyText}>
                    No health metrics match your search for "{searchQuery}".
                  </Text>
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={clearSearch}
                  >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
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
                </>
              )}
            </View>
          ) : (
            <>
              {filteredData.map(metric => (
                <HealthDataCard 
                  key={metric.id}
                  metric={metric}
                  icon={getIconForMetric(metric)}
                  onPress={() => router.push(`/health/metric/${metric.id}`)}
                />
              ))}
              
              <Text style={styles.resultCount}>
                Showing {filteredData.length} of {healthData.length} metrics
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Helper function to get the appropriate icon for a metric
function getIconForMetric(metric: HealthMetric) {
  const { Activity, Heart, Moon, Footprints, Scale } = require('lucide-react-native');
  
  if (metric.name === 'Steps') {
    return <Footprints size={24} color={colors.primary} />;
  } else if (metric.name.includes('Distance')) {
    return <Activity size={24} color={colors.primary} />;
  } else if (metric.name.includes('Energy') || metric.name.includes('Active')) {
    return <Activity size={24} color={colors.secondary} />;
  } else if (metric.name.includes('Heart')) {
    return <Heart size={24} color={colors.error} />;
  } else if (metric.name.includes('Sleep')) {
    return <Moon size={24} color={colors.primary} />;
  } else if (metric.name.includes('Weight')) {
    return <Scale size={24} color={colors.primary} />;
  } else {
    return <Activity size={24} color={colors.primary} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.background,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  clearSearchButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearSearchText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  resultCount: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
});