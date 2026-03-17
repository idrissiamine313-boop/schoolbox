import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, RefreshControl, ScrollView,
    StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0a1628';
const RED = '#ef4444';
const GOLD = '#f59e0b';
const GREEN = '#10b981';
const PURPLE = '#8b5cf6';
const BLUE = '#3b82f6';

function IcoBack({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoChevron({ s = 18, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string; step: number }> = {
  en_preparation: { label: 'En préparation', color: BLUE, emoji: '⏳', step: 1 },
  en_attente:     { label: 'En route', color: GOLD, emoji: '🚚', step: 2 },
  livree:         { label: 'Livré', color: GREEN, emoji: '✅', step: 3 },
  annulee:        { label: 'Annulée', color: RED, emoji: '❌', step: 0 },
};

function StatusBar2({ status }: { status: string }) {
  const steps = [
    { key: 'en_preparation', label: 'Préparation', emoji: '📦' },
    { key: 'en_attente', label: 'En route', emoji: '🚚' },
    { key: 'livree', label: 'Livré', emoji: '✅' },
  ];
  const currentStep = STATUS_CONFIG[status]?.step || 0;
  if (status === 'annulee') return (
    <View style={sb.annuleRow}>
      <Text style={sb.annuleTxt}>❌ Commande annulée</Text>
    </View>
  );
  return (
    <View style={sb.root}>
      {steps.map((step, i) => {
        const done = currentStep > i;
        const active = currentStep === i + 1;
        return (
          <React.Fragment key={step.key}>
            <View style={sb.stepCol}>
              <View style={[sb.stepCircle,
                done && { backgroundColor: GREEN, borderColor: GREEN },
                active && { backgroundColor: GOLD, borderColor: GOLD },
                !done && !active && { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }
              ]}>
                <Text style={{ fontSize: 12 }}>{step.emoji}</Text>
              </View>
              <Text style={[sb.stepLbl, (done || active) && { color: 'white' }]}>{step.label}</Text>
            </View>
            {i < 2 && (
              <View style={[sb.line, done && { backgroundColor: GREEN }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const sb = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 4 },
  stepCol: { alignItems: 'center', gap: 4, width: 70 },
  stepCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  stepLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  line: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 17 },
  annuleRow: { paddingVertical: 12, alignItems: 'center' },
  annuleTxt: { fontSize: 13, fontWeight: '800', color: RED },
});

export default function Commandes() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { loadOrders(); }, [appUser]);

  async function loadOrders() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', appUser?.student?.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  const filters = [
    { key: 'all', label: 'Toutes' },
    { key: 'en_preparation', label: '⏳ Prépa' },
    { key: 'en_attente', label: '🚚 En route' },
    { key: 'livree', label: '✅ Livrées' },
    { key: 'annulee', label: '❌ Annulées' },
  ];

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={PURPLE} size="large" />
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: NAV }]} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IcoBack s={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mes commandes</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeTxt}>{orders.length}</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity key={f.key}
            style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
            onPress={() => setFilter(f.key)}>
            <Text style={[s.filterTxt, filter === f.key && s.filterTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadOrders} tintColor={PURPLE} />}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      >
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 60 }}>📭</Text>
            <Text style={s.emptyTxt}>Aucune commande</Text>
            <Text style={s.emptySub}>Vos commandes apparaîtront ici</Text>
          </View>
        ) : (
          filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_preparation;
            const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short', year: 'numeric'
            });
            return (
              <TouchableOpacity key={order.id} style={s.orderCard}
                onPress={() => router.push({
                  pathname: '/parent/recu',
                  params: {
                    order_id: order.id,
                    qr_code: order.qr_token,
                    total: order.total_price?.toString(),
                    order_name: order.type === 'fourniture' ? 'Pack Fourniture' : 'Commande Boutique',
                    phone: order.phone || '',
                    address: order.address || '',
                  }
                } as any)}
                activeOpacity={0.88}>

                {/* Top row */}
                <View style={s.orderTop}>
                  <View style={s.orderLeft}>
                    <View style={[s.orderTypeIcon, { backgroundColor: cfg.color + '20' }]}>
                      <Text style={{ fontSize: 22 }}>
                        {order.type === 'fourniture' ? '📚' : '🛍️'}
                      </Text>
                    </View>
                    <View>
                      <Text style={s.orderType}>
                        {order.type === 'fourniture' ? 'Pack Fourniture' : 'Boutique'}
                      </Text>
                      <Text style={s.orderDate}>{date}</Text>
                    </View>
                  </View>
                  <View style={s.orderRight}>
                    <Text style={s.orderPrice}>{Number(order.total_price || 0).toFixed(0)} DH</Text>
                    <View style={[s.statusBadge, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '50' }]}>
                      <Text style={[s.statusTxt, { color: cfg.color }]}>{cfg.emoji} {cfg.label}</Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <StatusBar2 status={order.status} />

                {/* Bottom */}
                <View style={s.orderBottom}>
                  {order.address && (
                    <Text style={s.orderAddr} numberOfLines={1}>📍 {order.address}</Text>
                  )}
                  <View style={s.viewBtn}>
                    <Text style={s.viewTxt}>Voir le reçu</Text>
                    <IcoChevron s={16} c={PURPLE} />
                  </View>
                </View>
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

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 18, paddingBottom: 16, backgroundColor: 'rgba(10,22,40,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  headerBadge: { backgroundColor: PURPLE, borderRadius: 12, minWidth: 28, height: 28, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  headerBadgeTxt: { fontSize: 13, fontWeight: '900', color: 'white' },

  filtersRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  filterTxtActive: { color: 'white' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTxt: { fontSize: 18, fontWeight: '900', color: 'white' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  orderCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },

  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderTypeIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  orderType: { fontSize: 15, fontWeight: '900', color: 'white' },
  orderDate: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600', marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  orderPrice: { fontSize: 18, fontWeight: '900', color: GOLD },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusTxt: { fontSize: 11, fontWeight: '800' },

  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  orderAddr: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', flex: 1 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewTxt: { fontSize: 12, fontWeight: '800', color: PURPLE },
});