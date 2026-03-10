import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Image, RefreshControl,
    ScrollView, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const PURPLE = '#7c3aed';
const GREEN = '#059669';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconSearch({ size = 18, color = '#9ca3af' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} /><Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconCart({ size = 18, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M3 6h18" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconPlus({ size = 16, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>; }
function IconMinus({ size = 16, color = PURPLE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>; }
function IconBox({ size = 32, color = '#d1d5db' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 8L12 3 3 8v8l9 5 9-5V8z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" /><Path d="M12 3v18" stroke={color} strokeWidth={1.5} strokeLinecap="round" /><Path d="M3 8l9 5 9-5" stroke={color} strokeWidth={1.5} strokeLinejoin="round" /></Svg>; }

export default function CatalogueParent() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'general')
        .order('created_at', { ascending: false });
      setProducts(data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  function addToCart(id: string) {
    setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  }

  function removeFromCart(id: string) {
    setCart(p => {
      const n = (p[id] || 0) - 1;
      if (n <= 0) { const { [id]: _, ...rest } = p; return rest; }
      return { ...p, [id]: n };
    });
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products
    .filter(p => cart[p.id])
    .reduce((sum, p) => sum + Number(p.price) * (cart[p.id] || 0), 0);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  function handleCommander() {
    const items = products
      .filter(p => cart[p.id])
      .map(p => ({ id: p.id, name: p.name, price: p.price, quantity: cart[p.id] }));
    router.push({
      pathname: '/parent/panier',
      params: {
        type: 'catalogue',
        itemsJson: JSON.stringify(items),
        total: cartTotal,
      }
    } as any);
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

      {/* HEADER */}
      <View style={[s.header, { backgroundColor: PURPLE }]}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Catalogue</Text>
            <Text style={s.headerSub}>{products.length} produit{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}</Text>
          </View>
          {cartCount > 0 && (
            <TouchableOpacity style={s.cartBtn} onPress={handleCommander}>
              <IconCart size={18} color="white" />
              <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{cartCount}</Text></View>
            </TouchableOpacity>
          )}
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <IconSearch size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un produit..."
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
        </View>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={PURPLE} size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadProducts} tintColor={PURPLE} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIcon, { backgroundColor: PURPLE + '15' }]}><IconBox size={44} color={PURPLE} /></View>
              <Text style={s.emptyTxt}>Aucun produit trouvé</Text>
            </View>
          ) : (
            <View style={s.grid}>
              {filtered.map(p => {
                const qty = cart[p.id] || 0;
                return (
                  <View key={p.id} style={[s.productCard, qty > 0 && s.productCardSelected]}>
                    {/* Image */}
                    <View style={s.productImgWrap}>
                      {p.image_url ? (
                        <Image source={{ uri: p.image_url }} style={s.productImg} />
                      ) : (
                        <View style={[s.productImg, { backgroundColor: PURPLE + '10', justifyContent: 'center', alignItems: 'center' }]}>
                          <IconBox size={32} color={PURPLE + '60'} />
                        </View>
                      )}
                      {qty > 0 && (
                        <View style={s.qtyBadge}>
                          <Text style={s.qtyBadgeTxt}>{qty}</Text>
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={s.productInfo}>
                      <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                      {p.description && <Text style={s.productDesc} numberOfLines={1}>{p.description}</Text>}
                      <Text style={s.productPrice}>{Number(p.price).toFixed(2)} MAD</Text>
                    </View>

                    {/* Actions */}
                    {qty === 0 ? (
                      <TouchableOpacity style={s.addBtn} onPress={() => addToCart(p.id)}>
                        <IconPlus size={16} color="white" />
                        <Text style={s.addBtnTxt}>Ajouter</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={s.qtyControl}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(p.id)}>
                          <IconMinus size={14} color={PURPLE} />
                        </TouchableOpacity>
                        <Text style={s.qtyTxt}>{qty}</Text>
                        <TouchableOpacity style={[s.qtyBtn, { backgroundColor: PURPLE }]} onPress={() => addToCart(p.id)}>
                          <IconPlus size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: cartCount > 0 ? 110 : 32 }} />
        </ScrollView>
      )}

      {/* BOTTOM BAR */}
      {cartCount > 0 && (
        <View style={s.bottomBar}>
          <View style={s.bottomInfo}>
            <Text style={s.bottomLabel}>{cartCount} article{cartCount !== 1 ? 's' : ''}</Text>
            <Text style={s.bottomTotal}>{cartTotal.toFixed(2)} MAD</Text>
          </View>
          <TouchableOpacity style={s.commanderBtn} onPress={handleCommander} activeOpacity={0.85}>
            <IconCart size={18} color="white" />
            <Text style={s.commanderTxt}>Commander</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)' },
  dec2: { position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  cartBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#e53e3e', borderRadius: 8, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  cartBadgeTxt: { fontSize: 10, fontWeight: '900', color: 'white' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  searchInput: { flex: 1, fontSize: 14, color: 'white', fontWeight: '500' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIcon: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 17, fontWeight: '900', color: NAV },
  grid: { gap: 10 },
  productCard: { backgroundColor: 'white', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#e5e7eb', shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  productCardSelected: { borderColor: PURPLE, backgroundColor: '#faf5ff' },
  productImgWrap: { position: 'relative' },
  productImg: { width: 70, height: 70, borderRadius: 14 },
  qtyBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: PURPLE, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  qtyBadgeTxt: { fontSize: 11, fontWeight: '900', color: 'white' },
  productInfo: { flex: 1, gap: 3 },
  productName: { fontSize: 14, fontWeight: '900', color: NAV },
  productDesc: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  productPrice: { fontSize: 15, fontWeight: '900', color: PURPLE },
  addBtn: { backgroundColor: PURPLE, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnTxt: { color: 'white', fontWeight: '800', fontSize: 12 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  qtyTxt: { fontSize: 16, fontWeight: '900', color: NAV, minWidth: 20, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', shadowColor: NAV, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  bottomInfo: { flex: 1 },
  bottomLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  bottomTotal: { fontSize: 22, fontWeight: '900', color: NAV },
  commanderBtn: { backgroundColor: PURPLE, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  commanderTxt: { color: 'white', fontWeight: '900', fontSize: 15 },
});