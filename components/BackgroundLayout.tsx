import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function BackgroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require('../assets/images/bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});