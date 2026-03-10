import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminParents() {
  const router = useRouter();
  return (
    <View style={s.container}>
      <Text style={s.title}>Parents</Text>
      <TouchableOpacity style={s.back} onPress={() => router.back()}>
        <Text style={s.backTxt}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc', padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '900', color: '#0f2356' },
  back: { marginTop: 20, backgroundColor: '#0f2356', borderRadius: 12, padding: 14, alignItems: 'center' },
  backTxt: { color: 'white', fontWeight: '800' },
});