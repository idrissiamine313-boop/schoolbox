import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Dimensions, Image, RefreshControl,
    ScrollView, StatusBar, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');
const NAV = '#0a1628';
const GOLD = '#f59e0b';
const PURPLE = '#8b5cf6';
const GREEN = '#10b981';
const RED = '#ef4444';
const CARD_W = (W - 48) / 2;

function IcoBack({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoSearch({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Svg>;
}

export default function Catalogue() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) {
        setProducts(data);
        const cats = [...new Set(data.map((p: any) => p.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  const filtered = products.filter(p => {
    const matchCat = category === 'all' || p.category === category;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={PURPLE} size="large" />
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: NAV }]} />
      <View style={s.glowTop} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IcoBack s={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Boutique</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeTxt}>{filtered.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchIcon}><IcoSearch s={16} c="rgba(255,255,255,0.4)" /></View>
        <Text
          style={s.searchInput}
          onPress={() => {}}
        >
          {search || 'Rechercher un produit...'}
        </Text>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catsRow}>
          {['all', ...categories].map(cat => (
            <TouchableOpacity key={cat}
              style={[s.catBtn, category === cat && s.catBtnActive]}
              onPress={() => setCategory(cat)}>
              <Text style={[s.catTxt, category === cat && s.catTxtActive]}>
                {cat === 'all' ? 'Tous' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadProducts} tintColor={PURPLE} />}
        contentContainerStyle={s.grid}
      >
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 60 }}>🛍️</Text>
            <Text style={s.emptyTxt}>Aucun produit</Text>
          </View>
        ) : (
          <View style={s.gridRow}>
            {filtered.map(product => (
              <TouchableOpacity key={product.id} style={s.productCard}
                onPress={() => router.push({ pathname: '/parent/product-detail', params: { id: product.id } } as any)}
                activeOpacity={0.88}>
                {/* Image */}
                <View style={s.productImgWrap}>
                  {product.image_url
                    ? <Image source={{ uri: product.image_url }} style={s.productImg} resizeMode="cover" />
                    : <View style={[s.productImg, s.placeholder]}><Text style={{ fontSize: 40 }}>🛍️</Text></View>
                  }
                  {product.category && (
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeTxt}>{product.category}</Text>
                    </View>
                  )}
                </View>
                {/* Info */}
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={s.productPrice}>{Number(product.price || 0).toFixed(0)} DH</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAV },
  glowTop: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(139,92,246,0.1)' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: 'rgba(10,22,40,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  headerBadge: { backgroundColor: PURPLE, borderRadius: 12, minWidth: 28, height: 28, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  headerBadgeTxt: { fontSize: 13, fontWeight: '900', color: 'white' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', margin: 16, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  searchIcon: {},
  searchInput: { flex: 1, color: 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: '600' },

  catsRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  catTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  catTxtActive: { color: 'white' },

  grid: { padding: 16, paddingBottom: 40 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTxt: { fontSize: 18, fontWeight: '900', color: 'white' },

  productCard: { width: CARD_W, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  productImgWrap: { height: 160, position: 'relative' },
  productImg: { width: '100%', height: 160 },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  catBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(10,22,40,0.8)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeTxt: { fontSize: 9, fontWeight: '800', color: 'white' },
  productInfo: { padding: 12, gap: 6 },
  productName: { fontSize: 13, fontWeight: '800', color: 'white', lineHeight: 18 },
  productPrice: { fontSize: 16, fontWeight: '900', color: GOLD },
});