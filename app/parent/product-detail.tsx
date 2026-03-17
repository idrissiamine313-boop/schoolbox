import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Dimensions, Image, Modal,
    ScrollView, StatusBar, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const { width: W, height: H } = Dimensions.get('window');
const NAV = '#0a1628';
const GOLD = '#f59e0b';
const PURPLE = '#8b5cf6';
const GREEN = '#10b981';
const RED = '#ef4444';

function IcoBack({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoCart({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M3 6h18M16 10a4 4 0 01-8 0" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Svg>;
}
function IcoZoom({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={c} strokeWidth={2} strokeLinecap="round" />
    <Path d="M11 8v6M8 11h6" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Svg>;
}
function IcoClose({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { loadProduct(); }, [id]);

  async function loadProduct() {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      setProduct(data);
    } catch {}
    setLoading(false);
  }

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={PURPLE} size="large" />
    </View>
  );

  if (!product) return (
    <View style={{ flex: 1, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 16 }}>Produit introuvable</Text>
    </View>
  );

  // Photos — image_url + images array ila kanu
  const photos: string[] = [];
  if (product.image_url) photos.push(product.image_url);
  if (product.image_urls && Array.isArray(product.image_urls)) photos.push(...product.image_urls);
  if (photos.length === 0) photos.push('');

  const total = Number(product.price || 0) * quantity;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: NAV }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ══════ PHOTOS CAROUSEL ══════ */}
        <View style={s.carouselWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / W);
              setActivePhoto(idx);
            }}
          >
            {photos.map((photo, i) => (
              <TouchableOpacity key={i} activeOpacity={0.95}
                onPress={() => { setZoomIndex(i); setZoomVisible(true); }}>
                {photo
                  ? <Image source={{ uri: photo }} style={s.carouselImg} resizeMode="cover" />
                  : <View style={[s.carouselImg, s.placeholder]}><Text style={{ fontSize: 80 }}>🛍️</Text></View>
                }
                {/* Zoom hint */}
                <View style={s.zoomHint}>
                  <IcoZoom s={16} c="white" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <IcoBack s={22} />
          </TouchableOpacity>

          {/* Dots */}
          {photos.length > 1 && (
            <View style={s.dotsRow}>
              {photos.map((_, i) => (
                <View key={i} style={[s.dot, i === activePhoto && s.dotActive]} />
              ))}
            </View>
          )}

          {/* Photos count */}
          <View style={s.photoCount}>
            <Text style={s.photoCountTxt}>{activePhoto + 1}/{photos.length}</Text>
          </View>
        </View>

        <View style={s.content}>

          {/* ══════ INFO PRODUIT ══════ */}
          <View style={s.infoCard}>
            {product.category && (
              <View style={s.categoryBadge}>
                <Text style={s.categoryTxt}>{product.category}</Text>
              </View>
            )}
            <Text style={s.productName}>{product.name}</Text>
            <Text style={s.productPrice}>{Number(product.price || 0).toFixed(0)} DH</Text>
            {product.description && (
              <Text style={s.productDesc}>{product.description}</Text>
            )}
          </View>

          {/* ══════ QUANTITÉ ══════ */}
          <View style={s.qtyCard}>
            <Text style={s.qtyLabel}>Quantité</Text>
            <View style={s.qtyRow}>
              <TouchableOpacity style={s.qtyBtn}
                onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Text style={s.qtyBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={s.qtyVal}>{quantity}</Text>
              <TouchableOpacity style={[s.qtyBtn, s.qtyBtnPlus]}
                onPress={() => setQuantity(q => q + 1)}>
                <Text style={[s.qtyBtnTxt, { color: 'white' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ══════ TOTAL ══════ */}
          <View style={s.totalCard}>
            <View style={s.totalRow}>
              <Text style={s.totalLbl}>{Number(product.price || 0).toFixed(0)} DH × {quantity}</Text>
              <Text style={s.totalVal}>{total.toFixed(0)} DH</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ══════ COMMANDER BUTTON ══════ */}
      <View style={s.bottomBar}>
        <View style={s.bottomInfo}>
          <Text style={s.bottomLbl}>Total</Text>
          <Text style={s.bottomPrice}>{total.toFixed(0)} DH</Text>
        </View>
        <TouchableOpacity style={s.commanderBtn}
          onPress={() => router.push({
            pathname: '/parent/panier',
            params: {
              type: 'catalogue',
              product_id: id,
              product_name: product.name,
              total: total.toString(),
              wrapping: '0',
            }
          } as any)}
          activeOpacity={0.88}>
          <IcoCart s={20} c="white" />
          <Text style={s.commanderTxt}>Commander</Text>
        </TouchableOpacity>
      </View>

      {/* ══════ ZOOM MODAL ══════ */}
      <Modal visible={zoomVisible} transparent animationType="fade"
        onRequestClose={() => setZoomVisible(false)}>
        <View style={s.zoomModal}>
          <TouchableOpacity style={s.zoomClose} onPress={() => setZoomVisible(false)}>
            <IcoClose s={24} c="white" />
          </TouchableOpacity>

          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            contentOffset={{ x: zoomIndex * W, y: 0 }}
            onMomentumScrollEnd={e => {
              setZoomIndex(Math.round(e.nativeEvent.contentOffset.x / W));
            }}
          >
            {photos.map((photo, i) => (
              <View key={i} style={s.zoomImgWrap}>
                <ScrollView
                  maximumZoomScale={4}
                  minimumZoomScale={1}
                  centerContent
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                >
                  {photo
                    ? <Image source={{ uri: photo }} style={s.zoomImg} resizeMode="contain" />
                    : <View style={s.zoomImg} />
                  }
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          {/* Dots zoom */}
          {photos.length > 1 && (
            <View style={s.zoomDots}>
              {photos.map((_, i) => (
                <View key={i} style={[s.dot, i === zoomIndex && s.dotActive]} />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAV },

  carouselWrap: { height: 360, position: 'relative' },
  carouselImg: { width: W, height: 360 },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
  backBtn: { position: 'absolute', top: 52, left: 18, width: 42, height: 42, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  zoomHint: { position: 'absolute', bottom: 12, right: 12, width: 34, height: 34, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dotsRow: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 20, backgroundColor: 'white' },
  photoCount: { position: 'absolute', top: 54, right: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  photoCountTxt: { fontSize: 12, fontWeight: '800', color: 'white' },

  content: { padding: 18, gap: 14 },

  infoCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  categoryBadge: { backgroundColor: 'rgba(139,92,246,0.25)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)' },
  categoryTxt: { fontSize: 11, fontWeight: '800', color: PURPLE },
  productName: { fontSize: 22, fontWeight: '900', color: 'white', lineHeight: 28 },
  productPrice: { fontSize: 28, fontWeight: '900', color: GOLD },
  productDesc: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 22, fontWeight: '500' },

  qtyCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyLabel: { fontSize: 15, fontWeight: '800', color: 'white' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  qtyBtnPlus: { backgroundColor: PURPLE, borderColor: PURPLE },
  qtyBtnTxt: { fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.8)', lineHeight: 28 },
  qtyVal: { fontSize: 22, fontWeight: '900', color: 'white', minWidth: 30, textAlign: 'center' },

  totalCard: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLbl: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  totalVal: { fontSize: 22, fontWeight: '900', color: GOLD },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10,22,40,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 18, paddingVertical: 14, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bottomInfo: { flex: 1 },
  bottomLbl: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  bottomPrice: { fontSize: 24, fontWeight: '900', color: GOLD },
  commanderBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: RED, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  commanderTxt: { fontSize: 16, fontWeight: '900', color: 'white' },

  zoomModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  zoomClose: { position: 'absolute', top: 52, right: 18, zIndex: 10, width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  zoomImgWrap: { width: W, height: H, justifyContent: 'center' },
  zoomImg: { width: W, height: H * 0.8 },
  zoomDots: { position: 'absolute', bottom: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
});