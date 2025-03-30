import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface AvatarProps {
  source?: string | { uri: string };
  uri?: string; // Added for backward compatibility
  size?: number;
  name?: string;
  showBorder?: boolean;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  uri,
  size = 40,
  name,
  showBorder = false,
  style
}) => {
  // Get initials from name
  const getInitials = () => {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  // Normalize source to get a proper uri string
  const getImageSource = () => {
    // If uri prop is provided (backwards compatibility)
    if (uri) {
      return { uri };
    }
    
    // If source is not provided
    if (!source) {
      return null;
    }
    
    // If source is already a string
    if (typeof source === 'string') {
      return { uri: source };
    }
    
    // If source is an object with uri property
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      return source;
    }
    
    // Fallback
    return null;
  };
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: showBorder ? 2 : 0,
  };
  
  const textStyle = {
    fontSize: size * 0.4,
  };
  
  const imageSource = getImageSource();
  
  return (
    <View style={[styles.container, containerStyle, style]}>
      {imageSource ? (
        <Image 
          source={imageSource} 
          style={styles.image} 
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, textStyle]}>{getInitials()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.background,
    fontWeight: 'bold',
  }
});