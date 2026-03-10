import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const NAV2 = '#1a3285';
const RED = '#f10f0f';
const SCHOOL_TYPES = ['Maternelle', 'Primaire', 'Collège', 'Lycée'];

// ── ICONS ──────────────────────────────────────────
function IconBack({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconPlus({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}
function IconEdit({ size = 16, color = NAV }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconTrash({ size = 16, color = RED }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconToggleOn({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="6" width="22" height="12" rx="6" stroke="#16a34a" strokeWidth={2} />
      <Circle cx="16" cy="12" r="4" fill="#16a34a" />
    </Svg>
  );
}
function IconToggleOff({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="6" width="22" height="12" rx="6" stroke="#9ca3af" strokeWidth={2} />
      <Circle cx="8" cy="12" r="4" fill="#9ca3af" />
    </Svg>
  );
}
function IconCamera({ size = 18, color = NAV }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function IconPin({ size = 14, color = '#718096' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function IconPhone({ size = 14, color = '#718096' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconSave({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconArrow({ size = 20, color = '#d1d5db' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── TYPE COLORS ────────────────────────────────────
const typeColors: Record<string, string> = {
  Maternelle: '#7c3aed', Primaire: NAV2, Collège: '#0369a1', Lycée: NAV,
};

function TypeBadge({ label }: { label: string }) {
  const color = typeColors[label] || NAV;
  return (
    <View style={{ backgroundColor: color + '18', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: color + '40' }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color }}>{label}</Text>
    </View>
  );
}

export default function AdminSchools() {
  const [schools, setSchools] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editSchool, setEditSchool] = useState<any>(null);
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [types, setTypes] = useState<string[]>(['Primaire']);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { loadSchools(); }, []);

  async function loadSchools() {
    setRefreshing(true);
    const { data } = await supabase
      .from('schools')
      .select('id, name, abbreviation, address, phone, type, is_active, logo_url, created_at')
      .order('created_at', { ascending: false });
    setSchools(data || []);
    setRefreshing(false);
  }

  function openAdd() {
    setEditSchool(null);
    setName(''); setAbbreviation(''); setAddress(''); setPhone('');
    setTypes(['Primaire']); setLogoUri(null); setRemoveLogo(false);
    setShowModal(true);
  }

  function openEdit(school: any) {
    setEditSchool(school);
    setName(school.name || '');
    setAbbreviation(school.abbreviation || '');
    setAddress(school.address || '');
    setPhone(school.phone || '');
    setTypes(school.type ? school.type.split(', ') : ['Primaire']);
    setLogoUri(null); setRemoveLogo(false);
    setShowModal(true);
  }

  function toggleType(t: string) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function pickLogo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) { setLogoUri(result.assets[0].uri); setRemoveLogo(false); }
  }

  function decode(base64: string): Uint8Array {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bufferLength = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
    const arraybuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arraybuffer);
    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
      const e1 = chars.indexOf(base64[i]);
      const e2 = chars.indexOf(base64[i + 1]);
      const e3 = chars.indexOf(base64[i + 2]);
      const e4 = chars.indexOf(base64[i + 3]);
      bytes[p++] = (e1 << 2) | (e2 >> 4);
      bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
      bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
    }
    return bytes;
  }

  async function uploadLogo(uri: string, schoolId: string): Promise<string | null> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const fileName = `school_${schoolId}_${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('schools').upload(fileName, decode(base64), { contentType: 'image/jpeg', upsert: true });
      if (error) return null;
      const { data } = supabase.storage.from('schools').getPublicUrl(fileName);
      return data.publicUrl;
    } catch { return null; }
  }

  async function saveSchool() {
    if (!name) { Alert.alert('Erreur', "Entrez le nom de l'école"); return; }
    if (types.length === 0) { Alert.alert('Erreur', 'Choisissez au moins un type'); return; }
    setLoading(true);
    if (editSchool) {
      const updates: any = { name, abbreviation, address, phone, type: types.join(', ') };
      if (removeLogo) updates.logo_url = null;
      if (logoUri) {
        const logoUrl = await uploadLogo(logoUri, editSchool.id);
        if (logoUrl) updates.logo_url = logoUrl;
      }
      const { error } = await supabase.from('schools').update(updates).eq('id', editSchool.id);
      if (error) { Alert.alert('Erreur', error.message); setLoading(false); return; }
    } else {
      const { data: school, error } = await supabase
        .from('schools').insert({ name, abbreviation, address, phone, type: types.join(', ') }).select().single();
      if (error) { Alert.alert('Erreur', error.message); setLoading(false); return; }
      if (logoUri && school) {
        const logoUrl = await uploadLogo(logoUri, school.id);
        if (logoUrl) await supabase.from('schools').update({ logo_url: logoUrl }).eq('id', school.id);
      }
    }
    setLoading(false); setShowModal(false); loadSchools();
  }

  async function toggleSchool(id: string, current: boolean) {
    await supabase.from('schools').update({ is_active: !current }).eq('id', id);
    loadSchools();
  }

  async function deleteSchool(id: string) {
    Alert.alert('Confirmer', 'Supprimer cette école?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await supabase.from('schools').delete().eq('id', id); loadSchools(); } }
    ]);
  }

  const currentLogo = editSchool?.logo_url && !removeLogo ? editSchool.logo_url : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <IconBack size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image source={require('../../assets/images/logo.jpg')} style={styles.sbLogo} />
            <View>
              <Text style={styles.headerTitle}>Écoles</Text>
              <Text style={styles.headerSub}>{schools.length} établissements</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <IconPlus size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── LIST ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadSchools} tintColor={NAV} />}
        showsVerticalScrollIndicator={false}
      >
        {schools.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Text style={{ fontSize: 48 }}>🏫</Text>
            </View>
            <Text style={styles.emptyTitle}>Aucune école</Text>
            <Text style={styles.emptySub}>Ajoutez votre première école</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
              <IconPlus size={16} color="white" />
              <Text style={styles.emptyBtnText}>Ajouter une école</Text>
            </TouchableOpacity>
          </View>
        ) : schools.map(school => (
          <TouchableOpacity
            key={school.id}
            style={styles.schoolCard}
            onPress={() => router.push({ pathname: '/admin/school-detail' as any, params: { id: school.id, name: school.name } })}
            activeOpacity={0.85}
          >
            {/* Logo */}
            <View style={styles.logoBox}>
              {school.logo_url
                ? <Image source={{ uri: school.logo_url }} style={styles.logoImg} />
                : <Text style={{ fontSize: 26 }}>🏫</Text>
              }
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.schoolName} numberOfLines={1}>{school.name}</Text>
                {school.abbreviation && (
                  <View style={styles.abbrBadge}>
                    <Text style={styles.abbrText}>{school.abbreviation}</Text>
                  </View>
                )}
              </View>

              {/* Types badges */}
              {school.type && (
                <View style={styles.typesRow}>
                  {school.type.split(', ').map((t: string) => <TypeBadge key={t} label={t} />)}
                </View>
              )}

              {/* Address & Phone */}
              <View style={styles.detailsRow}>
                {school.address ? (
                  <View style={styles.detailItem}>
                    <IconPin size={12} color="#9ca3af" />
                    <Text style={styles.detailText} numberOfLines={1}>{school.address}</Text>
                  </View>
                ) : null}
                {school.phone ? (
                  <View style={styles.detailItem}>
                    <IconPhone size={12} color="#9ca3af" />
                    <Text style={styles.detailText}>{school.phone}</Text>
                  </View>
                ) : null}
              </View>

              {/* Status dot */}
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: school.is_active ? '#16a34a' : '#9ca3af' }]} />
                <Text style={[styles.statusText, { color: school.is_active ? '#16a34a' : '#9ca3af' }]}>
                  {school.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(school)}>
                <IconEdit size={15} color={NAV} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleSchool(school.id, school.is_active)}>
                {school.is_active ? <IconToggleOn size={15} /> : <IconToggleOff size={15} />}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fef2f2' }]} onPress={() => deleteSchool(school.id)}>
                <IconTrash size={15} color={RED} />
              </TouchableOpacity>
            </View>

            {/* Arrow */}
            <IconArrow size={18} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── MODAL ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{editSchool ? 'Modifier École' : 'Nouvelle École'}</Text>
                  <Text style={styles.modalSub}>{editSchool ? 'Mettez à jour les informations' : 'Remplissez les informations'}</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Logo Picker */}
              <View style={styles.logoPicker}>
                <View style={styles.logoPreviewBox}>
                  {logoUri
                    ? <Image source={{ uri: logoUri }} style={styles.logoPreview} />
                    : currentLogo
                      ? <Image source={{ uri: currentLogo }} style={styles.logoPreview} />
                      : <Text style={{ fontSize: 36 }}>🏫</Text>
                  }
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <TouchableOpacity style={styles.changeLogoBtn} onPress={pickLogo}>
                    <IconCamera size={16} color={NAV} />
                    <Text style={styles.changeLogoBtnText}>Changer le logo</Text>
                  </TouchableOpacity>
                  {(logoUri || currentLogo) && (
                    <TouchableOpacity onPress={() => { setLogoUri(null); setRemoveLogo(true); }}>
                      <Text style={styles.removeLogoText}>Retirer le logo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Fields */}
              <Text style={styles.fieldLabel}>NOM DE L'ÉCOLE *</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={name} onChangeText={setName}
                  placeholder="École Al Fath" placeholderTextColor="#9ca3af" />
              </View>

              <Text style={styles.fieldLabel}>ABRÉVIATION</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={abbreviation}
                  onChangeText={t => setAbbreviation(t.toUpperCase())}
                  placeholder="ALF" placeholderTextColor="#9ca3af" maxLength={6} autoCapitalize="characters" />
              </View>

              <Text style={styles.fieldLabel}>ADRESSE</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={address} onChangeText={setAddress}
                  placeholder="Casablanca, Maroc" placeholderTextColor="#9ca3af" />
              </View>

              <Text style={styles.fieldLabel}>TÉLÉPHONE</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone}
                  placeholder="0522 123 456" placeholderTextColor="#9ca3af" keyboardType="phone-pad" />
              </View>

              <Text style={styles.fieldLabel}>TYPE D'ÉCOLE</Text>
              <View style={styles.typeGrid}>
                {SCHOOL_TYPES.map(t => {
                  const color = typeColors[t] || NAV;
                  const active = types.includes(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, active && { backgroundColor: color, borderColor: color }]}
                      onPress={() => toggleType(t)}
                    >
                      <Text style={[styles.typeChipText, active && { color: 'white' }]}>
                        {active ? '✓  ' : ''}{t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveSchool} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="white" />
                  : <>
                      <IconSave size={18} color="white" />
                      <Text style={styles.saveBtnText}>
                        {editSchool ? 'Enregistrer les modifications' : "Ajouter l'école"}
                      </Text>
                    </>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // HEADER
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, overflow: 'hidden' },
  decCircle1: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 90 },
  decCircle2: { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sbLogo: { width: 60, height: 38, borderRadius: 50, borderWidth: 0.5, borderColor: 'rgba(255, 255, 255, 0)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 1 },
  addBtn: { width: 40, height: 40, backgroundColor: RED, borderRadius: 13, justifyContent: 'center', alignItems: 'center', shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },

  // SCROLL
  scroll: { padding: 10 },

  // SCHOOL CARD
  schoolCard: { backgroundColor: 'white', borderRadius: 18, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  logoBox: { width: 58, height: 58, backgroundColor: '#eef2ff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(15,35,86,0.1)' },
  logoImg: { width: 55, height: 58, resizeMode: 'cover' },
  cardInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  schoolName: { fontSize: 15, fontWeight: '900', color: NAV, flexShrink: 1 },
  abbrBadge: { backgroundColor: '#eef2ff', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(15,35,86,0.15)' },
  abbrText: { fontSize: 10, fontWeight: '800', color: NAV2 },
  typesRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  detailsRow: { gap: 2, marginTop: 2 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 11, color: '#646f80', flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardActions: { gap: 6 },
  actionBtn: { width: 32, height: 32, backgroundColor: '#eef2ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // EMPTY
  emptyState: { alignItems: 'center', paddingVertical: 70, gap: 12 },
  emptyIconBox: { width: 100, height: 100, backgroundColor: '#eef2ff', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: NAV },
  emptySub: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  emptyBtn: { backgroundColor: NAV, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  emptyBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '92%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: NAV },
  modalSub: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  modalCloseBtn: { width: 34, height: 34, backgroundColor: '#f3f4f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: '#374151', fontWeight: '700' },

  // LOGO PICKER
  logoPicker: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f7f8fc', borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  logoPreviewBox: { width: 72, height: 72, backgroundColor: '#eef2ff', borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(15,35,86,0.12)' },
  logoPreview: { width: 72, height: 72, resizeMode: 'cover' },
  changeLogoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eef2ff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: 'rgba(15,35,86,0.15)' },
  changeLogoBtnText: { color: NAV, fontWeight: '700', fontSize: 13 },
  removeLogoText: { color: RED, fontWeight: '700', fontSize: 12, textAlign: 'center' },

  // FIELDS
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8, marginTop: 18 },
  inputBox: { backgroundColor: '#f7f8fc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  input: { fontSize: 15, color: NAV, fontWeight: '600' },

  // TYPE CHIPS
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f7f8fc' },
  typeChipText: { fontSize: 13, fontWeight: '700', color: '#374151' },

  // SAVE BTN
  saveBtn: { backgroundColor: NAV, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, shadowColor: NAV, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
});