import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated, ScrollView, Share, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path } from 'react-native-svg';

const NAV = '#0a1628';
const RED = '#ef4444';
const GOLD = '#f59e0b';
const GREEN = '#10b981';
const PURPLE = '#8b5cf6';

function IcoHome({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoShare({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoOrders({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Svg>;
}

export default function Recu() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    order_id: string;
    qr_code: string;
    total: string;
    order_name: string;
    phone: string;
    address: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  // الـ QR value — نتحققو منو
  const qrValue = params.qr_code && params.qr_code.length > 3
    ? params.qr_code
    : params.order_id || 'SB-000000';

  useEffect(() => {
    saveToQRHistory();
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(checkAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  async function saveToQRHistory() {
    try {
      const existing = await AsyncStorage.getItem('qr_history');
      const history = existing ? JSON.parse(existing) : [];
      // تحققو ماكيتكررش نفس الـ order
      const exists = history.find((h: any) => h.id === params.order_id);
      if (!exists) {
        history.unshift({
          id: params.order_id,
          qr_code: qrValue,
          order_name: params.order_name,
          total: params.total,
          phone: params.phone,
          address: params.address,
          created_at: new Date().toISOString(),
        });
        await AsyncStorage.setItem('qr_history', JSON.stringify(history.slice(0, 50)));
      }
    } catch {}
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `🎓 SchoolBox — Reçu de commande\n\n📦 ${params.order_name}\n💰 Total: ${params.total} DH\n📍 ${params.address}\n\n🔑 Code: ${qrValue}\n\nPrésentez ce code au livreur.`,
      });
    } catch {}
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: NAV }]} />
      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50, alignItems: 'center', paddingTop: 60 }}
      >
        {/* Check animation */}
        <Animated.View style={[s.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
            <Text style={{ fontSize: 50 }}>✅</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%', paddingHorizontal: 24 }}>
          <Text style={s.successTitle}>Commande confirmée !</Text>
          <Text style={s.successSub}>{dateStr} à {timeStr}</Text>

          {/* QR Card */}
          <View style={s.qrCard}>
            <View style={s.qrHeader}>
              <Text style={s.qrHeaderTitle}>🎓 SchoolBox</Text>
              <Text style={s.qrHeaderSub}>Code de livraison</Text>
            </View>

            <View style={s.qrWrap}>
              <QRCode
                value={qrValue}
                size={200}
                backgroundColor="white"
                color={NAV}
              />
            </View>

            <View style={s.qrCodeRow}>
              <Text style={s.qrCodeTxt}>{qrValue}</Text>
            </View>

            <View style={s.qrInfoBox}>
              <Text style={s.qrInfoTxt}>⚠️ Ce code est valable une seule fois</Text>
              <Text style={s.qrInfoTxt}>Présentez-le au livreur pour valider</Text>
            </View>
          </View>

          {/* Détails */}
          <View style={s.detailCard}>
            <Text style={s.detailTitle}>📋 Détails de la commande</Text>
            {[
              { label: '📦 Commande', value: params.order_name },
              { label: '💰 Total', value: `${params.total} DH`, color: GOLD },
              { label: '📞 Téléphone', value: params.phone },
              { label: '📍 Adresse', value: params.address },
            ].map((item, i) => (
              <View key={i} style={[s.detailRow, i < 3 && s.detailBorder]}>
                <Text style={s.detailLbl}>{item.label}</Text>
                <Text style={[s.detailVal, item.color ? { color: item.color } : {}]} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.actionBtn} onPress={handleShare} activeOpacity={0.85}>
              <IcoShare s={18} c={PURPLE} />
              <Text style={[s.actionTxt, { color: PURPLE }]}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.actionBtnGold]}
              onPress={() => router.push('/parent/commandes' as any)} activeOpacity={0.85}>
              <IcoOrders s={18} c={GOLD} />
              <Text style={[s.actionTxt, { color: GOLD }]}>Mes commandes</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.homeBtn}
            onPress={() => router.replace('/parent/home' as any)} activeOpacity={0.88}>
            <IcoHome s={20} c="white" />
            <Text style={s.homeTxt}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAV },
  glowTop: { position: 'absolute', top: -100, left: '50%', marginLeft: -150, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(16,185,129,0.12)' },
  glowBottom: { position: 'absolute', bottom: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(139,92,246,0.1)' },

  checkCircle: { width: 100, height: 100, backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(16,185,129,0.3)' },
  successTitle: { fontSize: 26, fontWeight: '900', color: 'white', marginBottom: 6, textAlign: 'center' },
  successSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: 28, textAlign: 'center' },

  qrCard: { width: '100%', backgroundColor: 'white', borderRadius: 28, overflow: 'hidden', marginBottom: 16, shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
  qrHeader: { backgroundColor: NAV, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  qrHeaderTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  qrHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600' },
  qrWrap: { padding: 28, alignItems: 'center', backgroundColor: 'white' },
  qrCodeRow: { backgroundColor: '#f8fafc', paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  qrCodeTxt: { fontSize: 14, fontWeight: '900', color: NAV, letterSpacing: 1.5 },
  qrInfoBox: { backgroundColor: '#fef3c7', padding: 14, alignItems: 'center', gap: 4 },
  qrInfoTxt: { fontSize: 12, color: '#92400e', fontWeight: '700', textAlign: 'center' },

  detailCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16, gap: 2 },
  detailTitle: { fontSize: 15, fontWeight: '900', color: 'white', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, gap: 10 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  detailLbl: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '700', width: 110 },
  detailVal: { fontSize: 13, fontWeight: '800', color: 'white', flex: 1, textAlign: 'right' },

  actionsRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.3)' },
  actionBtnGold: { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' },
  actionTxt: { fontSize: 13, fontWeight: '800' },

  homeBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  homeTxt: { fontSize: 15, fontWeight: '800', color: 'white' },
});