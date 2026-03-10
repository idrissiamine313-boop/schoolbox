import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function ParentCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => { loadCodes(); }, []);

  async function loadCodes() {
    setRefreshing(true);
    const { data } = await supabase
      .from('parent_codes')
      .select('id, code, parent_name, parent_phone, is_active, student:students(full_name, level:levels(name), class:classes(name))')
      .order('created_at', { ascending: false });
    setCodes(data || []);
    setRefreshing(false);
  }

  async function shareCode(item: any) {
    await Share.share({
      message: `🎒 SchoolBox - Code Parent\n\nÉlève: ${item.student?.full_name}\nNiveau: ${item.student?.level?.name} - ${item.student?.class?.name}\n\n🔑 Code: ${item.code}\n🔒 Mot de passe: SchoolBox2024!\n\n📱 Téléchargez l'app SchoolBox et connectez-vous avec ce code.`,
    });
  }

  async function toggleCode(id: string, current: boolean) {
    await supabase.from('parent_codes').update({ is_active: !current }).eq('id', id);
    loadCodes();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔑 Codes Parents</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCodes} tintColor={Colors.danger} />}
      >
        <Text style={styles.countText}>{codes.length} codes générés</Text>

        {codes.map(item => (
          <View key={item.id} style={[styles.card, !item.is_active && styles.cardInactive]}>
            {/* Student info */}
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.student?.full_name?.[0]}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.student?.full_name}</Text>
                <Text style={styles.studentClass}>
                  {item.student?.level?.name} · {item.student?.class?.name}
                </Text>
                {item.parent_name && (
                  <Text style={styles.parentName}>👤 {item.parent_name}</Text>
                )}
                {item.parent_phone && (
                  <Text style={styles.parentPhone}>📞 {item.parent_phone}</Text>
                )}
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode
                value={item.code}
                size={120}
                color={item.is_active ? '#111827' : '#9CA3AF'}
                backgroundColor="white"
              />
            </View>

            {/* Code */}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>CODE</Text>
              <Text style={styles.codeValue}>{item.code}</Text>
            </View>
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordLabel}>MOT DE PASSE</Text>
              <Text style={styles.passwordValue}>SchoolBox2024!</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => shareCode(item)}
              >
                <Text style={styles.shareBtnText}>📤 Partager</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, item.is_active ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                onPress={() => toggleCode(item.id, item.is_active)}
              >
                <Text style={styles.toggleBtnText}>
                  {item.is_active ? '🔴 Désactiver' : '🟢 Activer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {codes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔑</Text>
            <Text style={styles.emptyTitle}>Aucun code</Text>
            <Text style={styles.emptySubtitle}>Importez des élèves via Excel</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8 },
  backText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  countText: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 2 },
  studentClass: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  parentName: { fontSize: 12, color: '#374151', fontWeight: '600' },
  parentPhone: { fontSize: 12, color: '#6B7280' },
  qrContainer: { alignItems: 'center', marginBottom: 16, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 16 },
  codeContainer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 8, alignItems: 'center' },
  codeLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 2, marginBottom: 4 },
  codeValue: { fontSize: 24, fontWeight: '900', color: Colors.primary, letterSpacing: 4 },
  passwordContainer: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  passwordLabel: { fontSize: 10, fontWeight: '800', color: '#16A34A', letterSpacing: 2, marginBottom: 4 },
  passwordValue: { fontSize: 16, fontWeight: '700', color: '#16A34A' },
  actions: { flexDirection: 'row', gap: 10 },
  shareBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, padding: 12, alignItems: 'center' },
  shareBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  toggleBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#FEF2F2' },
  toggleBtnInactive: { backgroundColor: '#F0FDF4' },
  toggleBtnText: { fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280' },
});