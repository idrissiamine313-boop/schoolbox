import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, RefreshControl, ScrollView,
    StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const GREEN = '#059669';
const ORANGE = '#d97706';
const GRAY = '#6b7280';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconBox({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 8L12 3 3 8v8l9 5 9-5V8z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M12 3v18" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M3 8l9 5 9-5" stroke={color} strokeWidth={2} strokeLinejoin="round" /></Svg>; }
function IconBook({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconClock({ size = 16, color = ORANGE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconCheck({ size = 16, color = GREEN }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconX({ size = 16, color = RED }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={2.5} strokeLinecap="round" /><Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>; }
function IconTruck({ size = 16, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="9" width="15" height="9" rx="1" stroke={color} strokeWidth={2} /><Path d="M16 9h3l3 4v5h-6V9z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Circle cx="5.5" cy="18.5" r="1.5" stroke={color} strokeWidth={2} /><Circle cx="18.5" cy="18.5" r="1.5" stroke={color} strokeWidth={2} /></Svg>; }
function IconQr({ size = 18, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={2} /><Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={2} /><Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth={2} /><Path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconEmpty({ size = 48, color = '#d1d5db' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" /><Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></Svg>; }

const STATUS_CONFIG: any = {
  en_preparation: { label: 'En préparation', color: ORANGE, bg: '#fef3c7', border: '#fcd34d', Icon: IconClock },
  en_attente: { label: 'En attente', color: NAV, bg: '#e0e7ff', border: '#a5b4fc', Icon: IconTruck },
  livree: { label: 'Livrée', color: GREEN, bg: '#dcfce7', border: '#86efac', Icon: IconCheck },
  annulee: { label: 'Annulée', color: RED, bg: '#fee2e2', border: '#fca5a5', Icon: IconX },
};

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'en_preparation', label: 'En prép.' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'livree', label: 'Livrées' },
  { key: 'annulee', label: 'Annulées' },
];

export default function CommandesParent() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadCommandes(); }, []);

  async function loadCommandes() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          id, status, type, total_price, wrapping, created_at, address, phone, qr_code,
          items:order_items(id, item_name, item_price, quantity, item_type),
          fourniture:fournitures(id, name),
          student:students(id, full_name, school:schools(name, logo_url))
        `)
        .eq('parent_code_id', appUser?.id)
        .order('created_at', { ascending: false });
      setCommandes(data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  const filtered = filter === 'all' ? commandes : commandes.filter(c => c.status === filter);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Mes Commandes</Text>
            <Text style={s.headerSub}>{commandes.length} commande{commandes.length !== 1 ? 's' : ''} au total</Text>
          </View>
        </View>

        {/* Stats rapides */}
        <View style={s.statsRow}>
          {[
            { key: 'en_preparation', color: ORANGE },
            { key: 'en_attente', color: NAV },
            { key: 'livree', color: GREEN },
            { key: 'annulee', color: RED },
          ].map(st => {
            const count = commandes.filter(c => c.status === st.key).length;
            const cfg = STATUS_CONFIG[st.key];
            return (
              <View key={st.key} style={s.statBox}>
                <Text style={[s.statNum, { color: 'white' }]}>{count}</Text>
                <Text style={s.statLbl}>{cfg.label.split(' ')[0]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* FILTERS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[s.filterBtn, filter === f.key && s.filterBtnActive]} onPress={() => setFilter(f.key)}>
            <Text style={[s.filterTxt, filter === f.key && s.filterTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LIST */}
      {loading ? (
        <View style={s.center}><ActivityIndicator color={NAV} size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCommandes} tintColor={NAV} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}><IconEmpty size={48} color="#d1d5db" /></View>
              <Text style={s.emptyTxt}>Aucune commande</Text>
              <Text style={s.emptySub}>Vos commandes apparaîtront ici</Text>
            </View>
          ) : filtered.map(cmd => {
            const cfg = STATUS_CONFIG[cmd.status] || STATUS_CONFIG.en_preparation;
            const isLivree = cmd.status === 'livree';
            const isFourniture = cmd.type === 'fourniture';
            return (
              <View key={cmd.id} style={s.card}>
                {/* Card header */}
                <View style={s.cardTop}>
                  <View style={[s.typeIcon, { backgroundColor: isFourniture ? '#f0fdf4' : '#eef2ff' }]}>
                    {isFourniture ? <IconBook size={20} color={GREEN} /> : <IconBox size={20} color="#7c3aed" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle} numberOfLines={1}>
                      {isFourniture ? (cmd.fourniture?.name || 'Fourniture') : 'Catalogue'}
                    </Text>
                    <Text style={s.cardDate}>{formatDate(cmd.created_at)}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                    <cfg.Icon size={12} color={cfg.color} />
                    <Text style={[s.statusTxt, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {/* Items */}
                {cmd.items?.length > 0 && (
                  <View style={s.itemsList}>
                    {cmd.items.slice(0, 3).map((item: any, i: number) => (
                      <View key={i} style={s.itemRow}>
                        <View style={s.itemDot} />
                        <Text style={s.itemName} numberOfLines={1}>{item.item_name}</Text>
                        <Text style={s.itemPrice}>{Number(item.item_price).toFixed(2)} MAD</Text>
                      </View>
                    ))}
                    {cmd.items.length > 3 && (
                      <Text style={s.moreItems}>+{cmd.items.length - 3} autres articles</Text>
                    )}
                  </View>
                )}

                {/* Wrapping */}
                {cmd.wrapping && (
                  <View style={s.wrappingRow}>
                    <Text style={s.wrappingTxt}>🛡️ Protection cahiers incluse</Text>
                  </View>
                )}

                {/* Footer */}
                <View style={s.cardFooter}>
                  <View style={{ gap: 2 }}>
                    {cmd.address && <Text style={s.addressTxt} numberOfLines={1}>📍 {cmd.address}</Text>}
                    <Text style={s.totalTxt}>Total: <Text style={s.totalAmt}>{Number(cmd.total_price).toFixed(2)} MAD</Text></Text>
                  </View>

                  {/* QR button — غير للـ commandes en_attente */}
                  {(cmd.status === 'en_attente' || isLivree) && cmd.qr_code && (
                    <TouchableOpacity
                      style={[s.qrBtn, isLivree && { backgroundColor: '#dcfce7', borderColor: '#86efac' }]}
                      onPress={() => router.push({ pathname: '/parent/recu', params: { orderId: cmd.id } } as any)}
                    >
                      <IconQr size={16} color={isLivree ? GREEN : NAV} />
                      <Text style={[s.qrBtnTxt, isLivree && { color: GREEN }]}>
                        {isLivree ? 'Reçu' : 'QR Code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Progress bar */}
                <View style={s.progressWrap}>
                  {['en_preparation', 'en_attente', 'livree'].map((st, i) => {
                    const steps = ['en_preparation', 'en_attente', 'livree'];
                    const currentIdx = steps.indexOf(cmd.status);
                    const active = i <= currentIdx && cmd.status !== 'annulee';
                    return (
                      <View key={st} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[s.progressDot, active && s.progressDotActive, cmd.status === 'annulee' && s.progressDotCancelled]} />
                        {i < 2 && <View style={[s.progressLine, active && i < currentIdx && s.progressLineActive]} />}
                      </View>
                    );
                  })}
                </View>
                <View style={s.progressLabels}>
                  <Text style={s.progressLabel}>Préparation</Text>
                  <Text style={s.progressLabel}>Livraison</Text>
                  <Text style={s.progressLabel}>Livrée</Text>
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
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)' },
  dec2: { position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statNum: { fontSize: 20, fontWeight: '900', color: 'white' },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: '700' },
  filterScroll: { maxHeight: 52, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb' },
  filterBtnActive: { backgroundColor: NAV, borderColor: NAV },
  filterTxt: { fontSize: 12, fontWeight: '700', color: GRAY },
  filterTxtActive: { color: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIcon: { width: 90, height: 90, backgroundColor: '#f3f4f6', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 18, fontWeight: '900', color: NAV },
  emptySub: { fontSize: 13, color: GRAY, fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 14, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  typeIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: NAV },
  cardDate: { fontSize: 11, color: GRAY, fontWeight: '500', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '800' },
  itemsList: { backgroundColor: '#f7f8fc', borderRadius: 12, padding: 10, marginBottom: 10, gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: NAV + '40' },
  itemName: { flex: 1, fontSize: 12, color: NAV, fontWeight: '600' },
  itemPrice: { fontSize: 12, fontWeight: '800', color: GREEN },
  moreItems: { fontSize: 11, color: GRAY, fontWeight: '600', textAlign: 'center', paddingTop: 2 },
  wrappingRow: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 8, marginBottom: 10 },
  wrappingTxt: { fontSize: 12, fontWeight: '700', color: ORANGE },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, marginBottom: 10 },
  addressTxt: { fontSize: 11, color: GRAY, fontWeight: '500' },
  totalTxt: { fontSize: 12, color: GRAY, fontWeight: '600' },
  totalAmt: { fontSize: 14, fontWeight: '900', color: NAV },
  qrBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#c7d2fe' },
  qrBtnTxt: { fontSize: 12, fontWeight: '800', color: NAV },
  progressWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#e5e7eb' },
  progressDotActive: { backgroundColor: NAV, borderColor: NAV },
  progressDotCancelled: { backgroundColor: RED, borderColor: RED },
  progressLine: { flex: 1, height: 2, backgroundColor: '#e5e7eb' },
  progressLineActive: { backgroundColor: NAV },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  progressLabel: { fontSize: 9, color: GRAY, fontWeight: '600', flex: 1, textAlign: 'center' },
});