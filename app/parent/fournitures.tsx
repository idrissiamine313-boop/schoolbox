import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, RefreshControl,
    ScrollView, StatusBar, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const GREEN = '#059669';
const ORANGE = '#d97706';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconBook({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCheck({ size = 16, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCart({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M3 6h18" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconShield({ size = 16, color = ORANGE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconImage({ size = 20, color = '#9ca3af' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="21 15 16 10 5 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="8.5" cy="8.5" r="1.5" fill={color} /><Path d="M21 3H3v18h18V3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconEmpty({ size = 48, color = '#d1d5db' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }

export default function FournituresParent() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [fournitures, setFournitures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [wrapping, setWrapping] = useState(false);

  useEffect(() => { loadFournitures(); }, []);

  async function loadFournitures() {
    setRefreshing(true);
    try {
      const student = appUser?.student_id;
      let query = supabase
        .from('fournitures')
        .select('*, items:fourniture_items(id, name, price, image_url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data } = await query;
      // فلتر حسب المدرسة والمستوى ديال الطالب
      const filtered = (data || []).filter((f: any) => {
        const schoolOk = !f.school_ids?.length || f.school_ids.includes(appUser?.student?.school?.id);
        const levelOk = !f.level_ids?.length || f.level_ids.includes(appUser?.student?.level_id);
        return schoolOk || levelOk || (!f.school_ids?.length && !f.level_ids?.length);
      });
      setFournitures(filtered);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  function selectFourniture(f: any) {
    setSelected(f);
    // كل الـ items محددة بالافتراضي
    const init: any = {};
    f.items?.forEach((item: any) => { init[item.id] = true; });
    setCheckedItems(init);
    setWrapping(false);
  }

  function toggleItem(id: string) {
    setCheckedItems(p => ({ ...p, [id]: !p[id] }));
  }

  function calcTotal() {
    if (!selected) return 0;
    let total = 0;
    selected.items?.forEach((item: any) => {
      if (checkedItems[item.id]) total += Number(item.price);
    });
    if (wrapping && selected.wrapping_price > 0) total += Number(selected.wrapping_price);
    return total;
  }

  function getSelectedItems() {
    if (!selected) return [];
    return selected.items?.filter((item: any) => checkedItems[item.id]) || [];
  }

  function handleCommander() {
    const items = getSelectedItems();
    if (items.length === 0) { Alert.alert('Attention', 'Sélectionnez au moins un article'); return; }
    router.push({
      pathname: '/parent/panier',
      params: {
        type: 'fourniture',
        fournitureId: selected.id,
        fournitureName: selected.name,
        itemsJson: JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, price: i.price }))),
        wrapping: wrapping ? '1' : '0',
        wrappingPrice: selected.wrapping_price || 0,
        total: calcTotal(),
      }
    } as any);
  }

  // LISTE DES FOURNITURES
  if (!selected) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={GREEN} />
        <View style={[s.header, { backgroundColor: GREEN }]}>
          <View style={s.dec1} /><View style={s.dec2} />
          <View style={s.headerRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>Fournitures</Text>
              <Text style={s.headerSub}>Choisissez une liste scolaire</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color={GREEN} size="large" /></View>
        ) : (
          <ScrollView
            contentContainerStyle={s.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFournitures} tintColor={GREEN} />}
            showsVerticalScrollIndicator={false}
          >
            {fournitures.length === 0 ? (
              <View style={s.empty}>
                <View style={[s.emptyIcon, { backgroundColor: GREEN + '15' }]}><IconEmpty size={44} color={GREEN} /></View>
                <Text style={s.emptyTxt}>Aucune fourniture disponible</Text>
                <Text style={s.emptySub}>Revenez plus tard</Text>
              </View>
            ) : fournitures.map(f => (
              <TouchableOpacity key={f.id} style={s.fCard} onPress={() => selectFourniture(f)} activeOpacity={0.85}>
                <View style={[s.fCardIcon, { backgroundColor: GREEN + '15' }]}>
                  <IconBook size={26} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.fCardTitle}>{f.name}</Text>
                  <Text style={s.fCardSub}>{f.items?.length || 0} articles</Text>
                  <Text style={s.fCardTotal}>
                    {(f.items?.reduce((sum: number, i: any) => sum + Number(i.price), 0) || 0).toFixed(2)} MAD
                  </Text>
                </View>
                {f.wrapping_price > 0 && (
                  <View style={s.wrappingBadge}>
                    <IconShield size={12} color={ORANGE} />
                    <Text style={s.wrappingBadgeTxt}>Protection</Text>
                  </View>
                )}
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Polyline points="9 18 15 12 9 6" stroke="#9ca3af" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            ))}
            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </View>
    );
  }

  // DETAIL FOURNITURE — اختيار الـ items
  const total = calcTotal();
  const selectedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />
      <View style={[s.header, { backgroundColor: GREEN }]}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => setSelected(null)}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{selected.name}</Text>
            <Text style={s.headerSub}>{selectedCount} article{selectedCount !== 1 ? 's' : ''} sélectionné{selectedCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        {/* Total */}
        <View style={s.totalBanner}>
          <Text style={s.totalLabel}>Total estimé</Text>
          <Text style={s.totalAmt}>{total.toFixed(2)} MAD</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.listTitle}>Sélectionnez vos articles</Text>

        {selected.items?.map((item: any) => {
          const checked = !!checkedItems[item.id];
          return (
            <TouchableOpacity key={item.id} style={[s.itemCard, checked && s.itemCardChecked]} onPress={() => toggleItem(item.id)} activeOpacity={0.85}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={s.itemImg} />
              ) : (
                <View style={[s.itemImg, { backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' }]}>
                  <IconImage size={20} color={GREEN} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemPrice}>{Number(item.price).toFixed(2)} MAD</Text>
              </View>
              <View style={[s.checkBox, checked && { backgroundColor: GREEN, borderColor: GREEN }]}>
                {checked && <IconCheck size={14} color="white" />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Protection cahiers */}
        {selected.wrapping_price > 0 && (
          <>
            <Text style={[s.listTitle, { marginTop: 16 }]}>Option supplémentaire</Text>
            <TouchableOpacity style={[s.itemCard, wrapping && s.itemCardChecked]} onPress={() => setWrapping(p => !p)} activeOpacity={0.85}>
              <View style={[s.itemImg, { backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' }]}>
                <IconShield size={22} color={ORANGE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemName}>🛡️ Protéger les cahiers</Text>
                <Text style={[s.itemPrice, { color: ORANGE }]}>+{Number(selected.wrapping_price).toFixed(2)} MAD</Text>
              </View>
              <View style={[s.checkBox, wrapping && { backgroundColor: ORANGE, borderColor: ORANGE }]}>
                {wrapping && <IconCheck size={14} color="white" />}
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM — Commander */}
      <View style={s.bottomBar}>
        <View style={s.bottomInfo}>
          <Text style={s.bottomLabel}>Total</Text>
          <Text style={s.bottomTotal}>{total.toFixed(2)} MAD</Text>
        </View>
        <TouchableOpacity style={s.commanderBtn} onPress={handleCommander} activeOpacity={0.85}>
          <IconCart size={18} color="white" />
          <Text style={s.commanderTxt}>Commander</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)' },
  dec2: { position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  totalBanner: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  totalAmt: { fontSize: 22, fontWeight: '900', color: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIcon: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 17, fontWeight: '900', color: NAV },
  emptySub: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  fCard: { backgroundColor: 'white', borderRadius: 18, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  fCardIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  fCardTitle: { fontSize: 15, fontWeight: '900', color: NAV, marginBottom: 3 },
  fCardSub: { fontSize: 12, color: '#6b7280', fontWeight: '500', marginBottom: 3 },
  fCardTotal: { fontSize: 14, fontWeight: '800', color: GREEN },
  wrappingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4 },
  wrappingBadgeTxt: { fontSize: 10, fontWeight: '800', color: ORANGE },
  listTitle: { fontSize: 13, fontWeight: '800', color: '#6b7280', letterSpacing: 0.5, marginBottom: 10 },
  itemCard: { backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#e5e7eb', shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  itemCardChecked: { borderColor: GREEN, backgroundColor: '#f0fdf4' },
  itemImg: { width: 48, height: 48, borderRadius: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: NAV, marginBottom: 3 },
  itemPrice: { fontSize: 13, fontWeight: '800', color: GREEN },
  checkBox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', shadowColor: NAV, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  bottomInfo: { flex: 1 },
  bottomLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  bottomTotal: { fontSize: 22, fontWeight: '900', color: NAV },
  commanderBtn: { backgroundColor: GREEN, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  commanderTxt: { color: 'white', fontWeight: '900', fontSize: 15 },
});