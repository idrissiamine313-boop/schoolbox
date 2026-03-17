import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Dimensions, Image, Linking,
  ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');

// --- PALETTE FORCÉE LIGHT MODE ---
const NAV = '#1E3A8A';   
const BG = '#FFFFFF';    // Rje3naha Byda 100% blast gris
const WHITE = '#FFFFFF';
const GOLD = '#F59E0B';
const GREEN = '#10B981';
const RED = '#EF4444';
const BLUE = '#3B82F6';
const PURPLE = '#8B5CF6';
const TEXT = '#1E293B';
const TEXT2 = '#64748B';

// --- ICONS ---
function IcoBack({ s = 24, c = WHITE }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoPdf({ s = 20, c = RED }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoCheck({ s = 18, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="20 6 9 17 4 12" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoCart({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M3 6h18M16 10a4 4 0 01-8 0" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Svg>;
}
function IcoVerified({ s = 16, c = GREEN }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="22 4 12 14.01 9 11.01" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

export default function FournitureDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appUser } = useAuth();
  const student = appUser?.student;

  const [fourniture, setFourniture] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wrapping, setWrapping] = useState(false);
  const WRAPPING_PRICE = 50;

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const { data: f } = await supabase.from('fournitures').select('*').eq('id', id).single();
      setFourniture(f);
      const { data: its } = await supabase.from('fourniture_items').select('*').eq('fourniture_id', id).order('created_at', { ascending: true });
      setItems(its || []);
    } catch {}
    setLoading(false);
  }

  const totalItems = items.reduce((s, i) => s + Number(i.price || 0), 0);
  const basePrice = Number(fourniture?.price || 0) > 0 ? Number(fourniture.price) : totalItems;
  const totalFinal = basePrice + (wrapping ? WRAPPING_PRICE : 0);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: WHITE, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={NAV} size="large" />
    </View>
  );

  return (
    <View style={s.root}>
      {/* FORCE LIGHT CONTENT POUR STATUSBAR */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130, backgroundColor: BG }}>

        {/* ══════ HERO SECTION ══════ */}
        <View style={s.heroWrap}>
          {fourniture?.image_url
            ? <Image source={{ uri: fourniture.image_url }} style={s.heroImg} resizeMode="cover" />
            : <View style={[s.heroImg, s.heroPlaceholder]}><Text style={{ fontSize: 90 }}>📚</Text></View>
          }
          <View style={s.heroOverlay} />
          
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <IcoBack s={22} />
          </TouchableOpacity>

          <View style={s.verifiedBadge}>
            <IcoVerified s={14} c={WHITE} />
            <Text style={s.verifiedTxt}>Validé par l'école</Text>
          </View>

          <View style={s.heroInfo}>
            <View style={s.tagsRow}>
              {student?.school?.name && (
                <View style={s.schoolTag}>
                  <Text style={s.schoolTagTxt}>{student.school.name}</Text>
                </View>
              )}
              {student?.level?.name && (
                <View style={s.levelTag}>
                  <Text style={s.levelTagTxt}>{student.level.name}</Text>
                </View>
              )}
            </View>

            <Text style={s.heroTitle}>{fourniture?.name}</Text>
            
            <View style={s.priceRow}>
                <Text style={s.heroPrice}>{basePrice.toFixed(0)} <Text style={{fontSize:18}}>DH</Text></Text>
                {items.length > 0 && <Text style={s.itemCount}>• {items.length} articles</Text>}
            </View>
          </View>
        </View>

        <View style={s.content}>

          {/* 
             REMOVED: Partie Livraison & Phrase sur l'école supprimée ici. 
          */}

          {/* ══════ PDF BUTTON ══════ */}
          {fourniture?.pdf_url && (
            <TouchableOpacity style={s.pdfBtn} onPress={() => Linking.openURL(fourniture.pdf_url)} activeOpacity={0.8}>
              <View style={s.pdfIcon}><IcoPdf s={22} c={RED} /></View>
              <View style={s.pdfInfo}>
                <Text style={s.pdfTitle}>Liste officielle (PDF)</Text>
                <Text style={s.pdfSub}>Télécharger la liste validée</Text>
              </View>
              <View style={s.pdfArrow}><Text style={{ color: RED, fontSize: 18, fontWeight: '900' }}>↓</Text></View>
            </TouchableOpacity>
          )}

          {/* ══════ ITEMS LIST ══════ */}
          {items.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>📋 Contenu du pack</Text>
                <Text style={s.cardSubTitle}>Tout ce dont votre enfant a besoin</Text>
              </View>
              {items.map((item, i) => (
                <View key={item.id} style={[s.itemRow, i < items.length - 1 && s.itemBorder]}>
                  <View style={s.itemLeft}>
                    {item.image_url
                      ? <Image source={{ uri: item.image_url }} style={s.itemImg} resizeMode="cover" />
                      : <View style={[s.itemImg, s.itemImgPlaceholder]}><Text style={{ fontSize: 16 }}>📌</Text></View>
                    }
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                      {item.quantity && <Text style={s.itemQty}>Quantité : {item.quantity}</Text>}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ══════ WRAPPING ══════ */}
          <TouchableOpacity style={[s.wrappingCard, wrapping && s.wrappingActive]} onPress={() => setWrapping(!wrapping)} activeOpacity={0.9}>
            <View style={s.wrappingLeft}>
              <Text style={s.wrappingEmoji}>🎁</Text>
              <View>
                <Text style={s.wrappingTitle}>Service Couverture</Text>
                <Text style={s.wrappingSub}>Livres couverts et étiquetés</Text>
              </View>
            </View>
            <View style={s.wrappingRight}>
              <Text style={s.wrappingPrice}>+{WRAPPING_PRICE} DH</Text>
              <View style={[s.checkBox, wrapping && s.checkBoxActive]}>
                {wrapping && <IcoCheck s={14} c="white" />}
              </View>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ══════ BOTTOM BAR ══════ */}
      <View style={s.bottomBar}>
        <View style={s.bottomInfo}>
          <Text style={s.bottomLbl}>TOTAL À PAYER</Text>
          <Text style={s.bottomPrice}>{totalFinal.toFixed(0)} DH</Text>
        </View>
        <TouchableOpacity
          style={s.commanderBtn}
          onPress={() => router.push({
            pathname: '/parent/panier',
            params: {
              type: 'fourniture',
              fourniture_id: id,
              fourniture_name: fourniture?.name,
              total: totalFinal.toString(),
              wrapping: wrapping ? '1' : '0',
            }
          } as any)}
          activeOpacity={0.9}
        >
          <IcoCart s={20} c="white" />
          <Text style={s.commanderTxt}>Commander</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE }, // Force White Background

  // HERO
  heroWrap: { height: 340, position: 'relative', backgroundColor: NAV },
  heroImg: { width: W, height: 340, opacity: 0.8 },
  heroPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#334155' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  backBtn: { position: 'absolute', top: 52, left: 18, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  verifiedBadge: { position: 'absolute', top: 52, right: 18, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.9)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  verifiedTxt: { color: WHITE, fontSize: 11, fontWeight: '700' },

  heroInfo: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  schoolTag: { backgroundColor: BLUE, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  schoolTagTxt: { color: WHITE, fontSize: 10, fontWeight: '700' },
  levelTag: { backgroundColor: PURPLE, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  levelTagTxt: { color: WHITE, fontSize: 10, fontWeight: '700' },
  
  heroTitle: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 6, letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroPrice: { fontSize: 32, fontWeight: '900', color: GOLD },
  itemCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },

  content: { marginTop: -25, backgroundColor: BG, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, gap: 16 },

  // PDF
  pdfBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 16, padding: 14, gap: 14, shadowColor: '#000', shadowOpacity: 0.03, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  pdfIcon: { width: 42, height: 42, backgroundColor: '#FEF2F2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  pdfInfo: { flex: 1 },
  pdfTitle: { fontSize: 14, fontWeight: '800', color: TEXT },
  pdfSub: { fontSize: 11, color: TEXT2 },
  pdfArrow: { width: 32, height: 32, backgroundColor: '#F3F4F6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // ITEMS CARD
  card: { backgroundColor: WHITE, borderRadius: 20, padding: 0, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { padding: 16, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardTitle: { fontSize: 14, fontWeight: '900', color: NAV, textTransform: 'uppercase' },
  cardSubTitle: { fontSize: 11, color: TEXT2, marginTop: 2 },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  itemImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F1F5F9' },
  itemImgPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 13, fontWeight: '700', color: TEXT, lineHeight: 18 },
  itemQty: { fontSize: 11, color: TEXT2, marginTop: 2 },

  // WRAPPING
  wrappingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: WHITE, borderRadius: 18, padding: 16, borderWidth: 2, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  wrappingActive: { backgroundColor: '#F0FDF4', borderColor: GREEN },
  wrappingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrappingEmoji: { fontSize: 28 },
  wrappingTitle: { fontSize: 13, fontWeight: '800', color: TEXT },
  wrappingSub: { fontSize: 10, color: TEXT2, marginTop: 2 },
  wrappingRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrappingPrice: { fontSize: 14, fontWeight: '900', color: GREEN },
  checkBox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  checkBoxActive: { backgroundColor: GREEN, borderColor: GREEN },

  // BOTTOM BAR
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 20, paddingVertical: 15, paddingBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, elevation: 10 },
  bottomInfo: { flex: 1 },
  bottomLbl: { fontSize: 11, color: TEXT2, fontWeight: '800', textTransform: 'uppercase' },
  bottomPrice: { fontSize: 24, fontWeight: '900', color: NAV },
  commanderBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: NAV, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, shadowColor: NAV, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  commanderTxt: { fontSize: 16, fontWeight: '900', color: WHITE },
});