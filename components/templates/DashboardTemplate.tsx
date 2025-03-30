import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ChallengeList } from '../organisms/ChallengeList';
import { SuspenseWrapper } from '../SuspenseWrapper';

interface DashboardTemplateProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  userId?: string;
  onRefresh?: () => Promise<void>;
}

export function DashboardTemplate({
  header,
  footer,
  userId,
  onRefresh,
}: DashboardTemplateProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {header && <View style={styles.header}>{header}</View>}

        <View style={styles.content}>
          <SuspenseWrapper>
            <ChallengeList userId={userId} />
          </SuspenseWrapper>
        </View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 16,
  },
}); 