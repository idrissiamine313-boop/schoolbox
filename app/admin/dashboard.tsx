import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert, Image, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

function getGreeting(lang: string): string {
  const h = new Date().getHours();
  if (lang === 'ar') {
    if (h >= 5 && h < 12) return 'صباح الخير';
    if (h >= 12 && h < 18) return 'مساء الخير';
    return 'مساء النور';
  }
  if (lang === 'en') {
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 18) return 'Good afternoon';
    return 'Good evening';
  }
  if (h >= 5 && h < 12) return 'Bonjour';
  if (h >= 12 && h < 18) return 'Bon Après-midi';
  return 'Bonsoir';
}

const PERIODS_TRANS: any = {
  fr: { today: "Aujourd'hui", yesterday: 'Hier', week: 'Cette semaine', month: 'Ce mois', year: 'Cette année', all: 'Tout' },
  ar: { today: 'اليوم', yesterday: 'أمس', week: 'هذا الأسبوع', month: 'هذا الشهر', year: 'هذه السنة', all: 'الكل' },
  en: { today: 'Today', yesterday: 'Yesterday', week: 'This week', month: 'This month', year: 'This year', all: 'All' },
};

const DASH_TRANS: any = {
  fr: {
    overview: "Vue d'ensemble", management: 'Gestion',
    school: 'École', product: 'Produit', parent: 'Parent', event: 'Événement',
    inPrep: 'En prép.', waiting: 'En attente', cancelled: 'Annulées', delivered: 'Livrées',
    schools: 'Écoles', products: 'Produits', parents: 'Parents',
    driver: 'Livreur', library: 'Librairie', users: 'Utilisateurs',
    ordersAll: 'Voir toutes', orders: 'Commandes',
    balance: 'Solde du compte', admin: 'Admin',
  },
  ar: {
    overview: 'نظرة عامة', management: 'الإدارة',
    school: 'مدرسة', product: 'منتج', parent: 'ولي أمر', event: 'حدث',
    inPrep: 'قيد التحضير', waiting: 'في الانتظار', cancelled: 'ملغاة', delivered: 'مُسلَّمة',
    schools: 'المدارس', products: 'المنتجات', parents: 'الآباء',
    driver: 'سائق', library: 'مكتبة', users: 'المستخدمون',
    ordersAll: 'عرض الكل', orders: 'الطلبات',
    balance: 'رصيد الحساب', admin: 'المشرف',
  },
  en: {
    overview: 'Overview', management: 'Management',
    school: 'School', product: 'Product', parent: 'Parent', event: 'Event',
    inPrep: 'In prep.', waiting: 'Waiting', cancelled: 'Cancelled', delivered: 'Delivered',
    schools: 'Schools', products: 'Products', parents: 'Parents',
    driver: 'Driver', library: 'Library', users: 'Users',
    ordersAll: 'View all', orders: 'Orders',
    balance: 'Account balance', admin: 'Admin',
  },
};

function IconSchool({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9.5L12 4l9 5.5V20H3V9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /><Path d="M9 20v-6h6v6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /><Rect x="10" y="9" width="4" height="4" rx="0.5" stroke={color} strokeWidth={1.5} /></Svg>; }
function IconBox({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 8L12 3 3 8v8l9 5 9-5V8z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /><Path d="M12 3v18" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M3 8l9 5 9-5" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /></Svg>; }
function IconParent({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={1.8} /><Path d="M23 21v-2a4 4 0 00-3-3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth={1.8} strokeLinecap="round" /></Svg>; }
function IconDriver({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="1" y="9" width="22" height="9" rx="2" stroke={color} strokeWidth={1.8} /><Circle cx="6" cy="18" r="2" stroke={color} strokeWidth={1.8} /><Circle cx="18" cy="18" r="2" stroke={color} strokeWidth={1.8} /><Path d="M4 9l2-5h12l2 5" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /></Svg>; }
function IconLibrary({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19V5a2 2 0 012-2h13a1 1 0 011 1v13" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M4 19a2 2 0 002 2h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M8 7h8M8 11h8M8 15h5" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></Svg>; }
function IconUsers({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="9" cy="7" r="3" stroke={color} strokeWidth={1.8} /><Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M21 21v-2a4 4 0 00-3-3.85" stroke={color} strokeWidth={1.8} strokeLinecap="round" /></Svg>; }
function IconEvent({ size = 24, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={1.8} /><Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" /></Svg>; }
function IconCart({ size = 28, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /><Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" /><Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" /></Svg>; }
function IconLogout({ size = 22, color = '#fc8181' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2.2} strokeLinecap="round" /></Svg>; }
function IconWallet({ size = 26, color = 'rgba(255,255,255,0.8)' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 12V7H5a2 2 0 010-4h14v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><Path d="M3 5v14a2 2 0 002 2h16v-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><Path d="M18 12a2 2 0 000 4h4v-4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" /></Svg>; }
function IconEye({ size = 14, color = 'rgba(255,255,255,0.55)' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} /></Svg>; }
function IconEyeOff({ size = 14, color = 'rgba(255,255,255,0.55)' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { lang, t } = useLang();
  const d = DASH_TRANS[lang];
  const periods = PERIODS_TRANS[lang];

  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState({ schools: 0, products: 0, parents: 0, events: 0, enPrep: 0, enAttente: 0, annulees: 0, livrees: 0 });
  const [loading, setLoading] = useState(true);
  const [balance] = useState(10000);
  const [showBalance, setShowBalance] = useState(false);
  const greeting = getGreeting(lang);

  useEffect(() => { loadStats(); }, [period]);

  async function loadStats() {
    setLoading(true);
    try {
      const now = new Date();
      let from: string | null = null;
      if (period === 'today') { const d = new Date(now); d.setHours(0,0,0,0); from = d.toISOString(); }
      else if (period === 'yesterday') { const d = new Date(now); d.setDate(d.getDate()-1); d.setHours(0,0,0,0); from = d.toISOString(); }
      else if (period === 'week') { const d = new Date(now); d.setDate(d.getDate()-7); from = d.toISOString(); }
      else if (period === 'month') { const d = new Date(now); d.setDate(1); d.setHours(0,0,0,0); from = d.toISOString(); }
      else if (period === 'year') { const d = new Date(now); d.setMonth(0,1); d.setHours(0,0,0,0); from = d.toISOString(); }
      const fromDate = from || '2000-01-01';
      const [
        { count: schools }, { count: parents }, { count: products },
        { count: enPrep }, { count: enAttente }, { count: annulees }, { count: livrees },
      ] = await Promise.all([
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('parent_codes').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'en_preparation').gte('created_at', fromDate),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'en_attente').gte('created_at', fromDate),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'annulee').gte('created_at', fromDate),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'livree').gte('created_at', fromDate),
      ]);
      setStats({ schools: schools||0, products: products||0, parents: parents||0, events: 0, enPrep: enPrep||0, enAttente: enAttente||0, annulees: annulees||0, livrees: livrees||0 });
    } catch {}
    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert(t.logout, t.logoutMsg, [
      { text: t.cancel, style: 'cancel' },
      { text: t.confirm, style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth/login' as any); } },
    ]);
  }

  const S = (n: number) => loading ? '—' : String(n);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2356" />
      <View style={styles.header}>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
        <View style={styles.headerTop}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Image source={require('../../assets/images/logo.jpg')} style={styles.logoImg} />
            </View>
            <View>
              <Text style={styles.logoName}>SchoolBox</Text>
              <Text style={styles.logoSub}>ADMIN</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <IconLogout size={20} color="#fc8181" />
          </TouchableOpacity>
        </View>
        <View style={styles.greeting}>
          <Text style={styles.greetingSub}>{greeting},</Text>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingMain}>{d.admin}</Text>
            <View style={styles.onlineDot} />
          </View>
        </View>
        <TouchableOpacity style={styles.balanceCard} onPress={() => setShowBalance(p => !p)} activeOpacity={0.85}>
          <View>
            <View style={styles.balanceLabelRow}>
              {showBalance ? <IconEye size={14} /> : <IconEyeOff size={14} />}
              <Text style={styles.balanceLabel}>{d.balance}</Text>
            </View>
            <Text style={styles.balanceNum}>
              {showBalance ? `${balance.toLocaleString('fr-FR')},00 ` : '••••••  '}
              <Text style={styles.balanceDH}>DH</Text>
            </Text>
          </View>
          <View style={styles.walletBox}><IconWallet size={26} /></View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll} contentContainerStyle={styles.periodContent}>
          {Object.entries(periods).map(([key, label]) => (
            <TouchableOpacity key={key} style={[styles.periodBtn, period === key && styles.periodBtnActive]} onPress={() => setPeriod(key)}>
              <Text style={[styles.periodText, period === key && styles.periodTextActive]}>{label as string}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>{d.overview}</Text>
        </View>
        <View style={styles.statsRow}>
          {[
            { Icon: IconSchool, num: S(stats.schools), label: d.school },
            { Icon: IconBox, num: S(stats.products), label: d.product },
            { Icon: IconParent, num: S(stats.parents), label: d.parent },
            { Icon: IconEvent, num: S(stats.events), label: d.event },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statIconWrap}><s.Icon size={20} color="#1a3285" /></View>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsRow2}>
          {[
            { num: S(stats.enPrep), label: d.inPrep, color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
            { num: S(stats.enAttente), label: d.waiting, color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
            { num: S(stats.annulees), label: d.cancelled, color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
            { num: S(stats.livrees), label: d.delivered, color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard2, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.statNum2, { color: s.color }]}>{s.num}</Text>
              <Text style={[styles.statLabel2, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionHeader, { marginTop: 6 }]}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>{d.management}</Text>
        </View>
        <View style={styles.gestionGrid}>
          {[
            { Icon: IconSchool,  label: d.schools,  route: '/admin/schools' },
            { Icon: IconBox,     label: d.products, route: '/admin/products' },
            { Icon: IconParent,  label: d.parents,  route: '/admin/parents' },
            { Icon: IconDriver,  label: d.driver,   route: '' },
            { Icon: IconLibrary, label: d.library,  route: '/admin/libraries' },
            { Icon: IconUsers,   label: d.users,    route: '/admin/users' },
          ].map((g, i) => (
            <TouchableOpacity key={i} style={styles.gestionBtn} onPress={() => g.route && router.push(g.route as any)}>
              <View style={styles.gestionIconWrap}><g.Icon size={22} color="white" /></View>
              <Text style={styles.gestionLabel}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.commandeBtn} onPress={() => router.push('/admin/orders' as any)}>
          <View style={styles.decCta1} />
          <View style={styles.decCta2} />
          <View>
            <Text style={styles.commandeSub}>{d.ordersAll}</Text>
            <Text style={styles.commandeTitle}>{d.orders}</Text>
          </View>
          <IconCart size={32} color="white" />
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const NAV = '#0f2356';
const NAV2 = '#1a3285';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 22, paddingHorizontal: 20, overflow: 'hidden' },
  decCircle1: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 90 },
  decCircle2: { position: 'absolute', bottom: -60, left: -20, width: 140, height: 140, backgroundColor: 'rgba(246,173,85,0.07)', borderRadius: 70 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 55, height: 50, backgroundColor: 'white', borderRadius: 80, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  logoImg: { width: '100%', height: '100%', resizeMode: 'contain' },
  logoName: { fontSize: 17, fontWeight: '800', color: 'white', letterSpacing: -0.3 },
  logoSub: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5 },
  logoutBtn: { width: 42, height: 42, backgroundColor: 'rgba(229,62,62,0.18)', borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(229,62,62,0.35)', justifyContent: 'center', alignItems: 'center' },
  greeting: { marginBottom: 18 },
  greetingSub: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 2 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greetingMain: { fontSize: 28, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  onlineDot: { width: 9, height: 9, backgroundColor: '#68d391', borderRadius: 5 },
  balanceCard: { backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  balanceLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  balanceNum: { fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  balanceDH: { fontSize: 15, fontWeight: '600', opacity: 0.7 },
  walletBox: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  periodScroll: { marginBottom: 16 },
  periodContent: { gap: 8, paddingHorizontal: 2, paddingVertical: 4 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e5e7eb' },
  periodBtnActive: { backgroundColor: NAV, borderColor: NAV },
  periodText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  periodTextActive: { color: 'white' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 },
  sectionBar: { width: 4, height: 22, backgroundColor: '#e53e3e', borderRadius: 4 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: NAV, letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', gap: 7, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 10, alignItems: 'center', gap: 4, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)', borderBottomWidth: 3, borderBottomColor: NAV2 },
  statIconWrap: { width: 40, height: 40, backgroundColor: '#eef2ff', borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  statNum: { fontSize: 18, fontWeight: '900', color: NAV },
  statLabel: { fontSize: 9, fontWeight: '700', color: '#718096', textAlign: 'center' },
  statsRow2: { flexDirection: 'row', gap: 7, marginBottom: 20 },
  statCard2: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 3, borderWidth: 1.5 },
  statNum2: { fontSize: 18, fontWeight: '900' },
  statLabel2: { fontSize: 9, fontWeight: '700', textAlign: 'center', opacity: 0.9 },
  gestionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  gestionBtn: { width: '47.5%', backgroundColor: NAV, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: NAV, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  gestionIconWrap: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  gestionLabel: { fontSize: 15, fontWeight: '800', color: 'white', letterSpacing: -0.2 },
  commandeBtn: { backgroundColor: '#e53e3e', borderRadius: 22, padding: 20, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#e53e3e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 14, elevation: 8, overflow: 'hidden', marginBottom: 4 },
  decCta1: { position: 'absolute', top: -30, right: 60, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 50 },
  decCta2: { position: 'absolute', bottom: -20, right: -10, width: 80, height: 80, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 40 },
  commandeSub: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  commandeTitle: { fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
});