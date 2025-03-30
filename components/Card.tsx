import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: boolean;
}

const Card = React.forwardRef<View, CardProps>(({ 
  children, 
  style,
  elevation = true
}, ref) => {
  return (
    <View 
      ref={ref}
      style={[
        styles.card, 
        elevation && styles.elevation,
        style
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  }
});

export { Card };