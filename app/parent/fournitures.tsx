import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Dimensions, Image, RefreshControl,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');

// --- PALETTE LIGHT MODE (Bhal Home) ---
const NAV = '#1E3A8A'; // Zre9 Foncé
const BG = '#F4F7FC';  // Khalfiya Bida
const WHITE = '#FFFFFF';
const GOLD = '#F5A623';
const TEXT = '#1E293B';
const TEXT2 = '#64748B';
const CARD_W = (W - 48) / 2;

// Icons adaptées l Light Mode (Couleur NAV par défaut)
function IcoBack({ s = 24, c = NAV }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoSearch({ s = 20, c = '#94A3B8' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Svg>;
}

export default function FournituresCatalogue() {
  const router = useRouter();
  const { appUser } = useAuth();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setRefreshing(true);
    try {
      // Hna bdelt 'products' b 'fournitures'
      const { data } = await supabase
        .from('fournitures')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (data) {
        setItems(data);
        // Ila kanou les fournitures 3ndhom 'category', ghadi ytbano hna auto
        const cats = [...new Set(data.map((p: any) => p.category).filter(Boolean))];
        
        // 🔥 HNA FIN ZEDT 'as any' BACH NSKTO ERROR 🔥
        setCategories(cats as any);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  // Logique de Filtrage
  const filtered = items.filter(p => {
    const matchCat = category === 'all' || p.category === category;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={NAV} size="large" />
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      
      {/* Background Decor (Optional) */}
      <View style={s.glowTop} />

      {/* Header */}
      <View style={s.headerWrap}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IcoBack s={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Fournitures</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeTxt}>{filtered.length}</Text>
        </View>
      </View>

      {/* Search Bar (Light Mode Style) */}
      <View style={s.searchWrap}>
        <View style={s.searchIcon}><IcoSearch s={18} /></View>
        <TextInput
          style={s.searchInput}
          placeholder="Rechercher une fourniture..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories Buttons */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catsRow}>
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

      {/* Grid des Fournitures */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={NAV} />}
        contentContainerStyle={s.grid}
      >
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 60 }}>📚</Text>
            <Text style={s.emptyTxt}>Aucune fourniture trouvée</Text>
          </View>
        ) : (
          <View style={s.gridRow}>
            {filtered.map(item => (
              <TouchableOpacity key={item.id} style={s.productCard}
                // Hna fin kanmchiw l Page Détail li saybna qbila
                onPress={() => router.push({ pathname: '/parent/fourniture-detail', params: { id: item.id } } as any)}
                activeOpacity={0.9}>
                
                {/* Image */}
                <View style={s.productImgWrap}>
                  {item.image_url
                    ? <Image source={{ uri: item.image_url }} style={s.productImg} resizeMode="cover" />
                    : <View style={[s.productImg, s.placeholder]}><Text style={{ fontSize: 40 }}>📚</Text></View>
                  }
                  {item.category && (
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeTxt}>{item.category}</Text>
                    </View>
                  )}
                </View>

                {/* Info (Light Mode) */}
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={s.productPrice}>{Number(item.price || 0).toFixed(0)} DH</Text>
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
  root: { flex: 1, backgroundColor: BG },
  
  // Dwiwra zreq khfifa lfouq
  glowTop: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(30, 58, 138, 0.05)' },

  // Header Style Light
  headerWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 54, paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 42, height: 42, backgroundColor: WHITE, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: NAV, textTransform: 'uppercase', flex: 1 },
  headerBadge: { backgroundColor: NAV, borderRadius: 10, minWidth: 26, height: 26, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  headerBadgeTxt: { fontSize: 12, fontWeight: '900', color: WHITE },

  // Search Style Light
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, margin: 16, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 10, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  searchIcon: {},
  searchInput: { flex: 1, color: TEXT, fontSize: 14, fontWeight: '600', height: 40 },

  // Categories Style Light
  catsRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: WHITE, borderWidth: 1, borderColor: '#E2E8F0' },
  catBtnActive: { backgroundColor: NAV, borderColor: NAV },
  catTxt: { fontSize: 12, fontWeight: '700', color: TEXT2 },
  catTxtActive: { color: WHITE },

  // Grid Style
  grid: { padding: 16, paddingBottom: 40 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: TEXT2 },

  // Card Style Light
  productCard: { width: CARD_W, backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  productImgWrap: { height: 150, position: 'relative' },
  productImg: { width: '100%', height: 150 },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  
  catBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(30, 58, 138, 0.9)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeTxt: { fontSize: 9, fontWeight: '800', color: WHITE },
  
  productInfo: { padding: 12, gap: 4 },
  productName: { fontSize: 12, fontWeight: '800', color: TEXT, lineHeight: 16, minHeight: 32 },
  productPrice: { fontSize: 16, fontWeight: '900', color: NAV, marginTop: 4 },
});