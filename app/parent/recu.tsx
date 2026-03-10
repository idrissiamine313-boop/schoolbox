import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const GREEN = '#059669';
const ORANGE = '#d97706';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCheck({ size = 40, color = GREEN }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconClock({ size = 40, color = ORANGE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconLocation({ size = 14, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={2} /><Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2} /></Svg>; }
function IconPhone({ size = 14, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCalendar({ size = 14, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Polyline points="3 9 21 9" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinejoin="round" /></Svg>; }

const STATUS_CONFIG: any = {
  en_preparation: { label: 'En préparation', color: ORANGE, bg: '#fef3c7', Icon: IconClock },
  en_attente: { label: 'En attente de livraison', color: NAV, bg: '#e0e7ff', Icon: IconClock },
  livree: { label: 'Livrée', color: GREEN, bg: '#dcfce7', Icon: IconCheck },
  annulee: { label: 'Annulée', color: RED, bg: '#fee2e2', Icon: IconClock },
};

export default function RecuScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrder(); }, []);

  async function loadOrder() {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, status, type, total_price, wrapping, created_at,
        address, phone, qr_code,
        items:order_items(id, item_name, item_price, quantity, item_type),
        fourniture:fournitures(id, name),
        student:students(id, full_name, school:schools(name))
      `)
      .eq('id', orderId)
      .single();
    setOrder(data);
    setLoading(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f8fc' }}>
        <ActivityIndicator color={NAV} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: NAV, fontWeight: '800' }}>Commande introuvable</Text>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_preparation;
  const isFourniture = order.type === 'fourniture';
  const itemsTotal = order.items?.reduce((sum: number, i: any) => sum + Number(i.item_price) * (i.quantity || 1), 0) || 0;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Reçu de commande</Text>
            <Text style={s.headerSub}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* STATUS CARD */}
        <View style={[s.statusCard, { backgroundColor: cfg.bg }]}>
          <cfg.Icon size={44} color={cfg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[s.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={s.statusDate}>{formatDate(order.created_at)}</Text>
          </View>
        </View>

        {/* QR CODE */}
        {order.qr_code && order.status !== 'annulee' && (
          <View style={s.qrCard}>
            <Text style={s.qrTitle}>Code de livraison</Text>
            <Text style={s.qrSub}>Montrez ce QR au livreur pour confirmer la livraison</Text>
            <View style={s.qrWrap}>
              <QRCode
                value={order.qr_code}
                size={200}
                color={NAV}
                backgroundColor="white"
              />
            </View>
            <View style={s.qrCodeTxt}>
              <Text style={s.qrCodeVal}>{order.qr_code}</Text>
            </View>
          </View>
        )}

        {/* INFOS ELEVE */}
        {order.student && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Élève</Text>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Nom complet</Text>
              <Text style={s.infoVal}>{order.student.full_name}</Text>
            </View>
            {order.student.school && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>École</Text>
                <Text style={s.infoVal}>{order.student.school.name}</Text>
              </View>
            )}
          </View>
        )}

        {/* ARTICLES */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {isFourniture ? `Fourniture — ${order.fourniture?.name || ''}` : 'Catalogue'}
          </Text>
          {order.items?.map((item: any, i: number) => (
            <View key={i} style={s.itemRow}>
              <View style={s.itemDot} />
              <Text style={s.itemName} numberOfLines={1}>{item.item_name}</Text>
              <Text style={s.itemQty}>x{item.quantity || 1}</Text>
              <Text style={s.itemPrice}>{Number(item.item_price).toFixed(2)} MAD</Text>
            </View>
          ))}
          {order.wrapping && (
            <View style={[s.itemRow, { backgroundColor: '#fef3c7', borderRadius: 10, padding: 8, marginTop: 4 }]}>
              <Text style={{ fontSize: 14 }}>🛡️</Text>
              <Text style={[s.itemName, { color: ORANGE }]}>Protection cahiers</Text>
            </View>
          )}
        </View>

        {/* LIVRAISON */}
        {(order.address || order.phone) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Livraison</Text>
            {order.address && (
              <View style={s.infoRow}>
                <IconLocation size={14} /><Text style={s.infoLabel}>Adresse</Text>
                <Text style={s.infoVal} numberOfLines={2}>{order.address}</Text>
              </View>
            )}
            {order.phone && (
              <View style={s.infoRow}>
                <IconPhone size={14} /><Text style={s.infoLabel}>Téléphone</Text>
                <Text style={s.infoVal}>{order.phone}</Text>
              </View>
            )}
          </View>
        )}

        {/* TOTAL */}
        <View style={s.totalCard}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total articles</Text>
            <Text style={s.totalVal}>{itemsTotal.toFixed(2)} MAD</Text>
          </View>
          {order.wrapping && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>🛡️ Protection cahiers</Text>
              <Text style={[s.totalVal, { color: ORANGE }]}>+inclus</Text>
            </View>
          )}
          <View style={[s.totalRow, s.totalFinal]}>
            <Text style={s.totalFinalLabel}>Total</Text>
            <Text style={s.totalFinalVal}>{Number(order.total_price).toFixed(2)} MAD</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)' },
  dec2: { position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '700', marginTop: 1 },
  scroll: { padding: 16 },
  statusCard: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  statusLabel: { fontSize: 16, fontWeight: '900' },
  statusDate: { fontSize: 12, color: '#6b7280', fontWeight: '500', marginTop: 3 },
  qrCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 14, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  qrTitle: { fontSize: 17, fontWeight: '900', color: NAV, marginBottom: 6 },
  qrSub: { fontSize: 12, color: '#6b7280', fontWeight: '500', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  qrWrap: { padding: 16, backgroundColor: 'white', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', marginBottom: 14 },
  qrCodeTxt: { backgroundColor: '#f7f8fc', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  qrCodeVal: { fontSize: 13, fontWeight: '800', color: NAV, letterSpacing: 2 },
  section: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(15,35,86,0.05)' },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: NAV, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', width: 90 },
  infoVal: { flex: 1, fontSize: 13, fontWeight: '700', color: NAV },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: NAV + '40' },
  itemName: { flex: 1, fontSize: 13, color: NAV, fontWeight: '600' },
  itemQty: { fontSize: 12, color: '#6b7280', fontWeight: '700' },
  itemPrice: { fontSize: 13, fontWeight: '800', color: GREEN },
  totalCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(15,35,86,0.05)' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  totalLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  totalVal: { fontSize: 13, fontWeight: '700', color: NAV },
  totalFinal: { borderTopWidth: 1.5, borderTopColor: '#f3f4f6', marginTop: 6, paddingTop: 12 },
  totalFinalLabel: { fontSize: 16, fontWeight: '900', color: NAV },
  totalFinalVal: { fontSize: 20, fontWeight: '900', color: NAV },
});