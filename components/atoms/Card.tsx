import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  variant?: 'default' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  variant = 'default',
}) => {
  const cardStyles = [
    styles.container,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    variant === 'default' && { elevation },
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  outlined: {
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  flat: {
    elevation: 0,
    shadowOpacity: 0,
  },
}); 