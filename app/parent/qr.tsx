import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator, RefreshControl, ScrollView,
    StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0a1628';
const GOLD = '#f59e0b';
const GREEN = '#10b981';
const PURPLE = '#8b5cf6';
const RED = '#ef4444';
const BLUE = '#3b82f6';

function IcoBack({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  en_preparation: { label: 'En préparation', color: BLUE, emoji: '⏳' },
  en_attente:     { label: 'En route', color: GOLD, emoji: '🚚' },
  livree:         { label: 'Livré', color: GREEN, emoji: '✅' },
  annulee:        { label: 'Annulée', color: RED, emoji: '❌' },
};

export default function QrScreen() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [appUser])
  );

  async function loadOrders() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', appUser?.student?.id)
        .not('qr_token', 'is', null)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

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
        <Text style={s.headerTitle}>Mon QR</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeTxt}>{orders.length}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadOrders} tintColor={PURPLE} />}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      >
        {orders.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 70 }}>📭</Text>
            <Text style={s.emptyTxt}>Aucun QR code</Text>
            <Text style={s.emptySub}>Vos codes apparaîtront ici après chaque commande</Text>
          </View>
        ) : (
          orders.map(order => {
            const isOpen = expanded === order.id;
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_preparation;
            const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short', year: 'numeric',
            });
            const time = new Date(order.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit', minute: '2-digit',
            });
            const qrValue = order.qr_token || order.id;

            return (
              <TouchableOpacity
                key={order.id}
                style={[s.qrCard, isOpen && s.qrCardOpen]}
                onPress={() => setExpanded(isOpen ? null : order.id)}
                activeOpacity={0.88}
              >
                {/* Top row */}
                <View style={s.cardTop}>
                  <View style={s.cardLeft}>
                    <View style={s.qrMini}>
                      <QRCode
                        value={qrValue}
                        size={48}
                        backgroundColor="white"
                        color={NAV}
                      />
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={s.cardName} numberOfLines={1}>
                        {order.type === 'fourniture' ? '📚 Pack Fourniture' : '🛍️ Boutique'}
                      </Text>
                      <Text style={s.cardDate}>{date} à {time}</Text>
                      <View style={s.cardBottom}>
                        <Text style={s.cardPrice}>{Number(order.total_price || 0).toFixed(0)} DH</Text>
                        <View style={[s.statusBadge, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
                          <Text style={[s.statusTxt, { color: cfg.color }]}>{cfg.emoji} {cfg.label}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={[s.chevron, isOpen && s.chevronOpen]}>
                    <Text style={{ color: PURPLE, fontSize: 16, fontWeight: '900' }}>
                      {isOpen ? '▲' : '▼'}
                    </Text>
                  </View>
                </View>

                {/* Expanded */}
                {isOpen && (
                  <View style={s.expandedWrap}>
                    <View style={s.divider} />

                    {/* QR Code grand */}
                    <View style={s.qrBig}>
                      <View style={s.qrBigInner}>
                        <QRCode
                          value={qrValue}
                          size={220}
                          backgroundColor="white"
                          color={NAV}
                        />
                      </View>
                      <Text style={s.qrCodeTxt}>{qrValue}</Text>

                      {/* Warning si déjà livré */}
                      {order.status === 'livree' ? (
                        <View style={[s.qrWarning, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' }]}>
                          <Text style={[s.qrWarningTxt, { color: GREEN }]}>✅ Commande déjà livrée</Text>
                          <Text style={[s.qrWarningTxt, { color: GREEN }]}>Ce code a été utilisé</Text>
                        </View>
                      ) : order.status === 'annulee' ? (
                        <View style={[s.qrWarning, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }]}>
                          <Text style={[s.qrWarningTxt, { color: RED }]}>❌ Commande annulée</Text>
                        </View>
                      ) : (
                        <View style={s.qrWarning}>
                          <Text style={s.qrWarningTxt}>⚠️ Code valable une seule fois</Text>
                          <Text style={s.qrWarningTxt}>Présentez au livreur pour valider</Text>
                        </View>
                      )}
                    </View>

                    {/* Détails */}
                    <View style={s.detailsWrap}>
                      {order.phone && (
                        <View style={s.detailRow}>
                          <Text style={s.detailLbl}>📞 Téléphone</Text>
                          <Text style={s.detailVal}>{order.phone}</Text>
                        </View>
                      )}
                      {order.address && (
                        <View style={s.detailRow}>
                          <Text style={s.detailLbl}>📍 Adresse</Text>
                          <Text style={s.detailVal} numberOfLines={2}>{order.address}</Text>
                        </View>
                      )}
                      {order.notes && (
                        <View style={s.detailRow}>
                          <Text style={s.detailLbl}>💬 Note</Text>
                          <Text style={s.detailVal} numberOfLines={2}>{order.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAV },
  glowTop: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(139,92,246,0.12)' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 18, paddingBottom: 16, backgroundColor: 'rgba(10,22,40,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  headerBadge: { backgroundColor: PURPLE, borderRadius: 12, minWidth: 28, height: 28, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  headerBadgeTxt: { fontSize: 13, fontWeight: '900', color: 'white' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 14 },
  emptyTxt: { fontSize: 20, fontWeight: '900', color: 'white' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '600', textAlign: 'center', lineHeight: 20 },

  qrCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  qrCardOpen: { borderColor: 'rgba(139,92,246,0.4)', backgroundColor: 'rgba(139,92,246,0.08)' },

  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  qrMini: { width: 62, height: 62, backgroundColor: 'white', borderRadius: 12, padding: 6, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 14, fontWeight: '900', color: 'white' },
  cardDate: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: '900', color: GOLD },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '800' },
  chevron: { width: 34, height: 34, backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  chevronOpen: { backgroundColor: 'rgba(139,92,246,0.3)' },

  expandedWrap: { marginTop: 14 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },

  qrBig: { alignItems: 'center', gap: 14 },
  qrBigInner: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  qrCodeTxt: { fontSize: 13, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  qrWarning: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', alignItems: 'center', gap: 4, width: '100%' },
  qrWarningTxt: { fontSize: 12, color: GOLD, fontWeight: '700', textAlign: 'center' },

  detailsWrap: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  detailLbl: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '700', width: 100 },
  detailVal: { fontSize: 13, fontWeight: '700', color: 'white', flex: 1, textAlign: 'right' },
});