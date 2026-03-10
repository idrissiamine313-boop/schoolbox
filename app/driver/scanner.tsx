import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DriverScanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner QR 📷</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 22, fontWeight: '800' },
});