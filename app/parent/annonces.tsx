import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Image, RefreshControl,
    ScrollView, StatusBar, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const ORANGE = '#d97706';
const BLUE = '#0369a1';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconBell({ size = 32, color = ORANGE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCalendar({ size = 32, color = BLUE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={2} /><Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconEmpty({ size = 48, color = '#d1d5db' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'annonce', label: '📢 Annonces' },
  { key: 'evenement', label: '📅 Événements' },
];

export default function AnnoncesParent() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadAnnonces(); }, []);

  async function loadAnnonces() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, body, image_url, type, created_at, school_ids, level_ids, branches')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setAnnonces(data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  const filtered = filter === 'all' ? annonces : annonces.filter(a => a.type === filter);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      {/* HEADER */}
      <View style={[s.header, { backgroundColor: ORANGE }]}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Annonces & Événements</Text>
            <Text style={s.headerSub}>{annonces.length} publication{annonces.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{annonces.filter(a => a.type === 'annonce').length}</Text>
            <Text style={s.statLbl}>Annonces</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statNum}>{annonces.filter(a => a.type === 'evenement').length}</Text>
            <Text style={s.statLbl}>Événements</Text>
          </View>
        </View>
      </View>

      {/* FILTERS */}
      <View style={s.filtersWrap}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.filterTxt, filter === f.key && s.filterTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={ORANGE} size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAnnonces} tintColor={ORANGE} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIcon, { backgroundColor: ORANGE + '15' }]}>
                <IconEmpty size={44} color={ORANGE} />
              </View>
              <Text style={s.emptyTxt}>Aucune publication</Text>
              <Text style={s.emptySub}>Revenez plus tard</Text>
            </View>
          ) : filtered.map(a => {
            const isEvent = a.type === 'evenement';
            const color = isEvent ? BLUE : ORANGE;
            const bg = isEvent ? '#e0f2fe' : '#fef3c7';
            return (
              <View key={a.id} style={s.card}>
                {/* Image */}
                {a.image_url ? (
                  <Image source={{ uri: a.image_url }} style={s.cardImg} />
                ) : (
                  <View style={[s.cardImgPlaceholder, { backgroundColor: bg }]}>
                    {isEvent
                      ? <IconCalendar size={40} color={color} />
                      : <IconBell size={40} color={color} />
                    }
                  </View>
                )}

                {/* Content */}
                <View style={s.cardBody}>
                  {/* Type badge */}
                  <View style={[s.typeBadge, { backgroundColor: bg }]}>
                    <Text style={[s.typeBadgeTxt, { color }]}>
                      {isEvent ? '📅 Événement' : '📢 Annonce'}
                    </Text>
                  </View>

                  <Text style={s.cardTitle}>{a.title}</Text>

                  {a.body ? (
                    <Text style={s.cardBody2} numberOfLines={3}>{a.body}</Text>
                  ) : null}

                  <Text style={s.cardDate}>{formatDate(a.created_at)}</Text>
                </View>
              </View>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { paddingTop: 52, paddingBottom: 18, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)' },
  dec2: { position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 24, fontWeight: '900', color: 'white' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  filtersWrap: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb' },
  filterBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  filterTxt: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  filterTxtActive: { color: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIcon: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 17, fontWeight: '900', color: NAV },
  emptySub: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: 20, marginBottom: 14, overflow: 'hidden', shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  cardImg: { width: '100%', height: 180 },
  cardImgPlaceholder: { width: '100%', height: 160, justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 14 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  typeBadgeTxt: { fontSize: 11, fontWeight: '800' },
  cardTitle: { fontSize: 17, fontWeight: '900', color: NAV, marginBottom: 6, lineHeight: 22 },
  cardBody2: { fontSize: 13, color: '#6b7280', fontWeight: '500', lineHeight: 20, marginBottom: 10 },
  cardDate: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
});