import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DriverOrders() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Livraisons du jour</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenue Livreur 🚗</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 26, fontWeight: '800', color: '#111827' },
});