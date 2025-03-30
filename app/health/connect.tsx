import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform
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
  Check,
  X,
  ArrowRight
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { healthService, HealthPermission } from '@/services/healthService';

export default function HealthConnectScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<HealthPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Health service icons mapping
  const permissionIcons: Record<string, JSX.Element> = {
    steps: <Footprints size={24} color={colors.primary} />,
    distance: <Activity size={24} color={colors.primary} />,
    calories: <Activity size={24} color={colors.secondary} />,
    heart_rate: <Heart size={24} color={colors.error} />,
    sleep: <Moon size={24} color={colors.primary} />,
    weight: <Scale size={24} color={colors.primary} />,
  };

  // Initialize health service
  useEffect(() => {
    const initializeHealth = async () => {
      try {
        await healthService.initialize();
        const currentPermissions = healthService.getPermissions();
        setPermissions(currentPermissions);
      } catch (error) {
        console.error('Failed to initialize health service:', error);
        Alert.alert(
          'Health Service Error',
          'Failed to initialize health tracking. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    initializeHealth();
  }, []);

  // Toggle permission selection
  const togglePermission = (id: string) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === id 
          ? { ...permission, granted: !permission.granted } 
          : permission
      )
    );
  };

  // Request selected permissions
  const requestPermissions = async () => {
    setConnecting(true);
    
    try {
      const permissionsToRequest = permissions
        .filter(p => p.granted)
        .map(p => p.id);
      
      if (permissionsToRequest.length === 0) {
        Alert.alert(
          'No Permissions Selected',
          'Please select at least one health metric to connect.'
        );
        setConnecting(false);
        return;
      }
      
      const result = await healthService.requestPermissions(permissionsToRequest);
      
      // Update local state with results
      setPermissions(prev => 
        prev.map(p => {
          const updated = result.find(r => r.id === p.id);
          return updated || p;
        })
      );
      
      Alert.alert(
        'Health Data Connected',
        'Your health data has been successfully connected to GoalStake.',
        [
          { 
            text: 'View Health Data', 
            onPress: () => router.push('/health/dashboard') 
          },
          { 
            text: 'OK', 
            style: 'cancel' 
          }
        ]
      );
    } catch (error) {
      console.error('Failed to request health permissions:', error);
      Alert.alert(
        'Permission Error',
        'Failed to connect health data. Please try again later.'
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Connect Health Data',
          headerBackTitle: 'Settings'
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Track Your Progress Automatically
            </Text>
            <Text style={styles.infoText}>
              Connect your health data to automatically track progress for fitness challenges.
              Select which health metrics you want to share with GoalStake.
            </Text>
          </Card>
          
          <Text style={styles.sectionTitle}>Available Health Metrics</Text>
          
          {loading ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading health services...</Text>
            </Card>
          ) : (
            <Card style={styles.permissionsCard}>
              {permissions.map(permission => (
                <TouchableOpacity
                  key={permission.id}
                  style={styles.permissionItem}
                  onPress={() => togglePermission(permission.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.permissionInfo}>
                    {permissionIcons[permission.id] || <Activity size={24} color={colors.primary} />}
                    <Text style={styles.permissionName}>{permission.name}</Text>
                  </View>
                  
                  <View style={[
                    styles.checkboxContainer,
                    permission.granted ? styles.checkboxSelected : {}
                  ]}>
                    {permission.granted ? (
                      <Check size={18} color={colors.background} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          )}
          
          <Text style={styles.sectionTitle}>Health Service</Text>
          
          <Card style={styles.serviceCard}>
            <View style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                {Platform.OS === 'ios' ? (
                  <Text style={styles.serviceName}>Apple Health</Text>
                ) : (
                  <Text style={styles.serviceName}>Google Fit</Text>
                )}
              </View>
              
              <View style={styles.serviceStatus}>
                <Text style={styles.statusText}>
                  {loading ? 'Checking...' : 'Available'}
                </Text>
              </View>
            </View>
          </Card>
          
          <Text style={styles.privacyNote}>
            Your health data is stored securely and only used for challenge verification.
            You can disconnect health services at any time.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Connect Health Data"
              onPress={requestPermissions}
              loading={connecting}
              disabled={loading || connecting}
            />
          </View>
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
  infoCard: {
    marginBottom: 20,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  loadingCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  permissionsCard: {
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionName: {
    fontSize: 16,
    color: colors.text,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceCard: {
    marginBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.success,
    marginRight: 8,
  },
  privacyNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 30,
  },
});