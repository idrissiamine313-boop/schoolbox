import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Dimensions, Image, Linking,
    Modal, ScrollView, StatusBar, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const { width: W, height: H } = Dimensions.get('window');
const NAV = '#0a1628';
const GOLD = '#f59e0b';
const PURPLE = '#8b5cf6';
const RED = '#ef4444';
const GREEN = '#10b981';

function IcoBack({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoPdf({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 13h6M9 17h4" stroke={c} strokeWidth={2} strokeLinecap="round" />
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
function IcoShare({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

export default function AnnonceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [annonce, setAnnonce] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomVisible, setZoomVisible] = useState(false);

  useEffect(() => { loadAnnonce(); }, [id]);

  async function loadAnnonce() {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();
      setAnnonce(data);
    } catch {}
    setLoading(false);
  }

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={PURPLE} size="large" />
    </View>
  );

  if (!annonce) return (
    <View style={{ flex: 1, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 16 }}>Annonce introuvable</Text>
    </View>
  );

  const isEvenement = annonce.type === 'evenement';
  const accentColor = isEvenement ? GOLD : PURPLE;
  const typeEmoji = isEvenement ? '📅' : '📢';
  const typeLabel = isEvenement ? 'Événement' : 'Annonce';

  const date = new Date(annonce.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: NAV }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ══════ IMAGE HERO ══════ */}
        {annonce.image_url ? (
          <View style={s.heroWrap}>
            <TouchableOpacity activeOpacity={0.95} onPress={() => setZoomVisible(true)}>
              <Image source={{ uri: annonce.image_url }} style={s.heroImg} resizeMode="cover" />
            </TouchableOpacity>

            {/* Overlay gradient */}
            <View style={s.heroOverlay} />

            {/* Back */}
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <IcoBack s={22} />
            </TouchableOpacity>

            {/* Zoom hint */}
            <TouchableOpacity style={s.zoomHint} onPress={() => setZoomVisible(true)}>
              <IcoZoom s={16} c="white" />
              <Text style={s.zoomHintTxt}>Agrandir</Text>
            </TouchableOpacity>

            {/* Type badge */}
            <View style={[s.typeBadgeHero, { backgroundColor: accentColor }]}>
              <Text style={s.typeBadgeTxt}>{typeEmoji} {typeLabel}</Text>
            </View>
          </View>
        ) : (
          /* No image — header simple */
          <View style={s.headerSimple}>
            <TouchableOpacity style={s.backBtnSimple} onPress={() => router.back()}>
              <IcoBack s={22} />
            </TouchableOpacity>
            <View style={[s.noImgIcon, { backgroundColor: accentColor + '20' }]}>
              <Text style={{ fontSize: 60 }}>{typeEmoji}</Text>
            </View>
          </View>
        )}

        <View style={s.content}>

          {/* ══════ TITRE & DATE ══════ */}
          <View style={s.titleCard}>
            <View style={[s.typeBadge, { backgroundColor: accentColor + '20', borderColor: accentColor + '50' }]}>
              <Text style={[s.typeBadgeSmTxt, { color: accentColor }]}>{typeEmoji} {typeLabel}</Text>
            </View>
            <Text style={s.title}>{annonce.title}</Text>
            <Text style={s.date}>📅 {date}</Text>
          </View>

          {/* ══════ BODY ══════ */}
          {annonce.body && (
            <View style={s.bodyCard}>
              <Text style={s.bodyTxt}>{annonce.body}</Text>
            </View>
          )}

          {/* ══════ PDF BUTTON ══════ */}
          {annonce.pdf_url && (
            <TouchableOpacity style={s.pdfBtn}
              onPress={() => Linking.openURL(annonce.pdf_url)}
              activeOpacity={0.85}>
              <View style={s.pdfIconWrap}>
                <IcoPdf s={24} c={RED} />
              </View>
              <View style={s.pdfInfo}>
                <Text style={s.pdfTitle}>Voir le document PDF</Text>
                <Text style={s.pdfSub}>Appuyez pour ouvrir</Text>
              </View>
              <View style={s.pdfArrow}>
                <Text style={{ color: RED, fontSize: 22, fontWeight: '900' }}>›</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ══════ SHARE ══════ */}
          <TouchableOpacity style={s.shareBtn}
            onPress={() => {
              const msg = `${typeEmoji} ${annonce.title}\n\n${annonce.body || ''}\n\n📅 ${date}`;
              require('react-native').Share.share({ message: msg });
            }}
            activeOpacity={0.85}>
            <IcoShare s={18} c={PURPLE} />
            <Text style={s.shareTxt}>Partager</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ══════ ZOOM MODAL ══════ */}
      {annonce.image_url && (
        <Modal visible={zoomVisible} transparent animationType="fade"
          onRequestClose={() => setZoomVisible(false)}>
          <View style={s.zoomModal}>
            <TouchableOpacity style={s.zoomClose} onPress={() => setZoomVisible(false)}>
              <IcoClose s={24} c="white" />
            </TouchableOpacity>
            <ScrollView
              maximumZoomScale={4}
              minimumZoomScale={1}
              centerContent
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.zoomContent}
            >
              <Image
                source={{ uri: annonce.image_url }}
                style={s.zoomImg}
                resizeMode="contain"
              />
            </ScrollView>
            <View style={s.zoomInfo}>
              <Text style={s.zoomTitle} numberOfLines={1}>{annonce.title}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAV },

  heroWrap: { height: 380, position: 'relative' },
  heroImg: { width: W, height: 380 },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(10,22,40,0.7)' },
  backBtn: { position: 'absolute', top: 52, left: 18, width: 42, height: 42, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  zoomHint: { position: 'absolute', bottom: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  zoomHintTxt: { fontSize: 12, fontWeight: '700', color: 'white' },
  typeBadgeHero: { position: 'absolute', bottom: 14, left: 14, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  typeBadgeTxt: { fontSize: 12, fontWeight: '900', color: 'white' },

  headerSimple: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 20, alignItems: 'center', gap: 20 },
  backBtnSimple: { alignSelf: 'flex-start', width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  noImgIcon: { width: 120, height: 120, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

  content: { padding: 18, gap: 14 },

  titleCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  typeBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', borderWidth: 1 },
  typeBadgeSmTxt: { fontSize: 12, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '900', color: 'white', lineHeight: 30 },
  date: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  bodyCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bodyTxt: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 24, fontWeight: '500' },

  pdfBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.3)', gap: 14 },
  pdfIconWrap: { width: 50, height: 50, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pdfInfo: { flex: 1 },
  pdfTitle: { fontSize: 15, fontWeight: '800', color: 'white' },
  pdfSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  pdfArrow: { width: 34, height: 34, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.3)' },
  shareTxt: { fontSize: 14, fontWeight: '800', color: PURPLE },

  zoomModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.97)' },
  zoomClose: { position: 'absolute', top: 52, right: 18, zIndex: 10, width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  zoomContent: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: H },
  zoomImg: { width: W, height: H * 0.85 },
  zoomInfo: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14, padding: 14 },
  zoomTitle: { fontSize: 15, fontWeight: '800', color: 'white', textAlign: 'center' },
});