import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Modal, RefreshControl, ScrollView,
    StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const NAV2 = '#1a3285';
const RED = '#e53e3e';
const PURPLE = '#7c3aed';

function IconBack({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconPlus({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2.5} strokeLinecap="round" /><Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>;
}
function IconEdit({ size = 16, color = NAV }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconTrash({ size = 16, color = RED }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconToggleOn({ size = 18 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="6" width="22" height="12" rx="6" stroke="#16a34a" strokeWidth={2} /><Circle cx="16" cy="12" r="4" fill="#16a34a" /></Svg>;
}
function IconToggleOff({ size = 18 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="6" width="22" height="12" rx="6" stroke="#9ca3af" strokeWidth={2} /><Circle cx="8" cy="12" r="4" fill="#9ca3af" /></Svg>;
}
function IconSave({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconLib({ size = 24, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19V5a2 2 0 012-2h13a1 1 0 011 1v13" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M4 19a2 2 0 002 2h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M8 7h8M8 11h8M8 15h5" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></Svg>;
}
function IconPhone({ size = 13, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconMapPin({ size = 13, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2} /></Svg>;
}
function IconSchool({ size = 13, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9.5L12 4l9 5.5V20H3V9.5z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M9 20v-6h6v6" stroke={color} strokeWidth={2} strokeLinejoin="round" /></Svg>;
}

export default function AdminLibraries() {
  const router = useRouter();
  const [libraries, setLibraries] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editLib, setEditLib] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setRefreshing(true);
    const [libRes, schoolRes] = await Promise.all([
      supabase.from('libraries').select('*, library_schools(school_id, schools(name))').order('created_at', { ascending: false }),
      supabase.from('schools').select('id, name').eq('is_active', true).order('name'),
    ]);
    setLibraries(libRes.data || []);
    setSchools(schoolRes.data || []);
    setRefreshing(false);
  }

  function openAdd() {
    setEditLib(null);
    setName(''); setPhone(''); setAddress(''); setSelectedSchools([]);
    setShowModal(true);
  }

  function openEdit(lib: any) {
    setEditLib(lib);
    setName(lib.name || '');
    setPhone(lib.phone || '');
    setAddress(lib.address || '');
    setSelectedSchools(lib.library_schools?.map((ls: any) => ls.school_id) || []);
    setShowModal(true);
  }

  function toggleSchool(id: string) {
    setSelectedSchools(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  async function saveLibrary() {
    if (!name) { Alert.alert('Erreur', 'Entrez le nom'); return; }
    setLoading(true);
    try {
      let libId = editLib?.id;
      if (editLib) {
        await supabase.from('libraries').update({ name, phone, address }).eq('id', editLib.id);
      } else {
        const { data } = await supabase.from('libraries').insert({ name, phone, address }).select().single();
        libId = data?.id;
      }
      // Sync schools
      await supabase.from('library_schools').delete().eq('library_id', libId);
      if (selectedSchools.length > 0) {
        await supabase.from('library_schools').insert(
          selectedSchools.map(sid => ({ library_id: libId, school_id: sid }))
        );
      }
      setShowModal(false);
      loadData();
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setLoading(false);
  }

  async function toggleLibrary(lib: any) {
    await supabase.from('libraries').update({ is_active: !lib.is_active }).eq('id', lib.id);
    loadData();
  }

  async function deleteLibrary(lib: any) {
    Alert.alert('Supprimer', `Supprimer "${lib.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await supabase.from('libraries').delete().eq('id', lib.id);
        loadData();
      }},
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <IconBack size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Librairies</Text>
            <Text style={styles.headerSub}>{libraries.length} librairie{libraries.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <IconPlus size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{libraries.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{libraries.filter(l => l.is_active).length}</Text>
            <Text style={styles.statLabel}>Actives</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{libraries.reduce((acc, l) => acc + (l.library_schools?.length || 0), 0)}</Text>
            <Text style={styles.statLabel}>Écoles liées</Text>
          </View>
        </View>
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={NAV} />}
        showsVerticalScrollIndicator={false}
      >
        {libraries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <IconLib size={40} color={PURPLE} />
            </View>
            <Text style={styles.emptyTitle}>Aucune librairie</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
              <IconPlus size={16} color="white" />
              <Text style={styles.emptyBtnText}>Ajouter une librairie</Text>
            </TouchableOpacity>
          </View>
        ) : libraries.map(lib => {
          const linkedSchools = lib.library_schools || [];
          return (
            <View key={lib.id} style={styles.card}>
              {/* Icon + Info */}
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <IconLib size={24} color={PURPLE} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.cardName}>{lib.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: lib.is_active ? '#dcfce7' : '#f3f4f6' }]}>
                      <View style={[styles.statusDot, { backgroundColor: lib.is_active ? '#16a34a' : '#9ca3af' }]} />
                      <Text style={[styles.statusText, { color: lib.is_active ? '#16a34a' : '#9ca3af' }]}>
                        {lib.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  {lib.phone ? (
                    <View style={styles.detailRow}>
                      <IconPhone size={12} color="#9ca3af" />
                      <Text style={styles.detailText}>{lib.phone}</Text>
                    </View>
                  ) : null}
                  {lib.address ? (
                    <View style={styles.detailRow}>
                      <IconMapPin size={12} color="#9ca3af" />
                      <Text style={styles.detailText}>{lib.address}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Écoles liées */}
              {linkedSchools.length > 0 && (
                <View style={styles.schoolsWrap}>
                  <View style={styles.detailRow}>
                    <IconSchool size={12} color={PURPLE} />
                    <Text style={[styles.detailText, { color: PURPLE, fontWeight: '700' }]}>
                      {linkedSchools.length} école{linkedSchools.length > 1 ? 's' : ''} liée{linkedSchools.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.schoolChips}>
                    {linkedSchools.slice(0, 3).map((ls: any) => (
                      <View key={ls.school_id} style={styles.schoolChip}>
                        <Text style={styles.schoolChipText}>{ls.schools?.name}</Text>
                      </View>
                    ))}
                    {linkedSchools.length > 3 && (
                      <View style={[styles.schoolChip, { backgroundColor: PURPLE + '18' }]}>
                        <Text style={[styles.schoolChipText, { color: PURPLE }]}>+{linkedSchools.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(lib)}>
                  <IconEdit size={15} color={NAV} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLibrary(lib)}>
                  {lib.is_active ? <IconToggleOn size={15} /> : <IconToggleOff size={15} />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fef2f2' }]} onPress={() => deleteLibrary(lib)}>
                  <IconTrash size={15} color={RED} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* MODAL */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{editLib ? 'Modifier' : 'Nouvelle librairie'}</Text>
                  <Text style={styles.modalSub}>{editLib ? 'Mise à jour' : 'Ajouter une librairie'}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>NOM *</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom de la librairie" placeholderTextColor="#9ca3af" />
              </View>

              <Text style={styles.fieldLabel}>TÉLÉPHONE</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="0612345678" placeholderTextColor="#9ca3af" keyboardType="phone-pad" />
              </View>

              <Text style={styles.fieldLabel}>ADRESSE</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Adresse complète" placeholderTextColor="#9ca3af" multiline />
              </View>

              <Text style={styles.fieldLabel}>ÉCOLES ASSIGNÉES</Text>
              {schools.length === 0 ? (
                <View style={styles.noSchoolBox}>
                  <Text style={styles.noSchoolText}>Aucune école disponible</Text>
                </View>
              ) : (
                <View style={styles.schoolsGrid}>
                  {schools.map(school => {
                    const selected = selectedSchools.includes(school.id);
                    return (
                      <TouchableOpacity
                        key={school.id}
                        style={[styles.schoolSelectChip, selected && { backgroundColor: PURPLE, borderColor: PURPLE }]}
                        onPress={() => toggleSchool(school.id)}
                      >
                        <Text style={[styles.schoolSelectText, selected && { color: 'white' }]}>{school.name}</Text>
                        {selected && <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={saveLibrary} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="white" />
                  : <><IconSave size={18} color="white" /><Text style={styles.saveBtnText}>{editLib ? 'Enregistrer' : 'Créer la librairie'}</Text></>
                }
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, overflow: 'hidden' },
  decCircle1: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 90 },
  decCircle2: { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 1 },
  addBtn: { width: 40, height: 40, backgroundColor: RED, borderRadius: 13, justifyContent: 'center', alignItems: 'center', shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statNum: { fontSize: 22, fontWeight: '900', color: 'white' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  scroll: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 14, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  cardIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: PURPLE + '18', justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '900', color: NAV, flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  detailText: { fontSize: 12, color: '#718096' },
  schoolsWrap: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, marginBottom: 10, gap: 6 },
  schoolChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  schoolChip: { backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  schoolChipText: { fontSize: 11, fontWeight: '700', color: NAV2 },
  cardActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  actionBtn: { width: 34, height: 34, backgroundColor: '#eef2ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 70, gap: 14 },
  emptyIconBox: { width: 90, height: 90, borderRadius: 28, backgroundColor: PURPLE + '18', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: NAV },
  emptyBtn: { backgroundColor: PURPLE, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '92%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: NAV },
  modalSub: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  closeBtn: { width: 34, height: 34, backgroundColor: '#f3f4f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 16, color: '#374151', fontWeight: '700' },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8, marginTop: 16 },
  inputBox: { backgroundColor: '#f7f8fc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  input: { fontSize: 15, color: NAV, fontWeight: '600' },
  noSchoolBox: { backgroundColor: '#fef9c3', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fde68a' },
  noSchoolText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
  schoolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  schoolSelectChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f7f8fc', flexDirection: 'row', alignItems: 'center', gap: 6 },
  schoolSelectText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  saveBtn: { backgroundColor: PURPLE, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
});