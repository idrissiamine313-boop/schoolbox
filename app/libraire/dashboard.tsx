import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions,
  Image, Linking, Modal, RefreshControl, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');

// ── PALETTE PREMIUM ──
const BG     = '#f6f7fb'; 
const NAV    = '#0f2356'; // K7el/Zre9 premium l'Header
const CARD   = '#ffffff'; 
const BORDER = '#e2e8f0'; 
const PURPLE = '#3b82f6';
const GOLD   = '#f59e0b';
const GOLD2  = '#d97706';
const RED    = '#ef4444';
const GREEN  = '#10b981';
const BLUE   = '#3b82f6';
const TEXT   = '#0f172a';
const TEXT2  = '#64748b';
const TEXT3  = '#94a3b8';

// ── ICONS SVG ──
function IcoLogout({ s = 20, c = '#fca5a5' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={c} strokeWidth={2.2} strokeLinecap="round" /><Polyline points="16 17 21 12 16 7" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M21 12H9" stroke={c} strokeWidth={2.2} strokeLinecap="round" /></Svg>; }
function IcoTruck({ s = 16, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="1" y="3" width="15" height="13" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 8h4l3 3v5h-7V8z" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="5.5" cy="18.5" r="2.5" stroke={c} strokeWidth={2.2} /><Circle cx="18.5" cy="18.5" r="2.5" stroke={c} strokeWidth={2.2} /></Svg>; }
function IcoCheck({ s = 16, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoX({ s = 16, c = RED }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2} /><Line x1="15" y1="9" x2="9" y2="15" stroke={c} strokeWidth={2} strokeLinecap="round" /><Line x1="9" y1="9" x2="15" y2="15" stroke={c} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IcoBack({ s = 20, c = TEXT }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoChevron({ s = 16, c = TEXT3 }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Polyline points="9 18 15 12 9 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoMap({ s = 15, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={c} strokeWidth={2} /><Circle cx="12" cy="10" r="3" stroke={c} strokeWidth={2} /></Svg>; }
function IcoPDF({ s = 15, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="14 2 14 8 20 8" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoPhone({ s = 15, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.5 19.79 19.79 0 01.65 2a2 2 0 012-2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoHome({ s = 16, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="9 22 9 12 15 12 15 22" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoRefresh({ s = 16, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M23 4v6h-6M1 20v-6h6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoClock({ s = 24, c = TEXT }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Circle cx="12" cy="12" r="10" /><Polyline points="12 6 12 12 16 14" /></Svg>; }
function IcoCheckCircle({ s = 24, c = TEXT }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><Polyline points="22 4 12 14.01 9 11.01" /></Svg>; }
function IcoCancelCircle({ s = 24, c = TEXT }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Circle cx="12" cy="12" r="10" /><Line x1="15" y1="9" x2="9" y2="15" /><Line x1="9" y1="9" x2="15" y2="15" /></Svg>; }

const SC: any = {
  en_preparation: { label: 'En préparation', color: GOLD,  bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  emoji: '⏳' },
  en_attente:     { label: 'En route',        color: BLUE,  bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  emoji: '🚚' },
  annulee:        { label: 'Annulée',         color: RED,   bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   emoji: '❌' },
  livree:         { label: 'Livrée',          color: GREEN, bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  emoji: '✅' },
};

type Tab = 'prep' | 'route' | 'annulee' | 'livree';
type SubScreen = 'tabs' | 'school' | 'niveau' | 'branche' | 'orders';

function MiniBadge({ count, color, bg, border, emoji }: any) {
  if (!count) return null;
  return <View style={[mb.b, { backgroundColor: bg, borderColor: border }]}><Text style={[mb.t, { color }]}>{emoji} {count}</Text></View>;
}
const mb = StyleSheet.create({
  b: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
  t: { fontSize: 10, fontWeight: '800' },
});

function MiniBadges({ c }: { c: any }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
      <MiniBadge count={c.prep} color={GOLD}  bg="rgba(245,158,11,0.15)"  border="rgba(245,158,11,0.3)"  emoji="⏳" />
      <MiniBadge count={c.att}  color={BLUE}  bg="rgba(59,130,246,0.15)"  border="rgba(59,130,246,0.3)"  emoji="🚚" />
      <MiniBadge count={c.liv}  color={GREEN} bg="rgba(16,185,129,0.15)"  border="rgba(16,185,129,0.3)"  emoji="✅" />
      <MiniBadge count={c.ann}  color={RED}   bg="rgba(239,68,68,0.15)"   border="rgba(239,68,68,0.3)"   emoji="❌" />
    </View>
  );
}

export default function LibraireDashboard() {
  const { appUser, signOut } = useAuth();
  const router = useRouter();

  const [lib, setLib]             = useState<any>(null);
  const [schools, setSchools]     = useState<any[]>([]);
  const [orders, setOrders]       = useState<any[]>([]);
  const [drivers, setDrivers]     = useState<any[]>([]);
  const [driverMap, setDriverMap] = useState<{ [id: string]: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [sbLogo, setSbLogo]       = useState<string | null>(null);

  const [tab, setTab]             = useState<Tab>('prep');
  const [subScreen, setSubScreen] = useState<SubScreen>('tabs');
  const [selSchool, setSelSchool] = useState<any>(null);
  const [selNiveau, setSelNiveau] = useState('');
  const [selBranche, setSelBranche] = useState('');

  const [selOrder, setSelOrder]   = useState<any>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [showDriver, setShowDriver] = useState(false);
  const [isBulk, setIsBulk]       = useState(false);
  const [bulkIds, setBulkIds]     = useState<string[]>([]);
  const [busy, setBusy]           = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Function pour afficher Bonjour/Bonsoir sur la base du temps
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return 'Bonjour ☀️';
    if (hour >= 12 && hour < 18) return 'Bon après-midi 🌤️';
    return 'Bonsoir 🌙';
  };

  useEffect(() => { 
    if (appUser) load(); 
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [appUser]);

  async function load() {
    setRefreshing(true);
    try {
      const { data: lg } = await supabase.from('app_settings').select('value').eq('key', 'sb_logo_url').single();
      if (lg?.value?.startsWith('http')) setSbLogo(lg.value);
    } catch {}

    if (!appUser?.library_id) { setRefreshing(false); return; }

    const { data: libData } = await supabase.from('libraries').select('*').eq('id', appUser.library_id).single();
    setLib(libData);

    const { data: ls } = await supabase.from('library_schools').select('school:schools(id,name,abbreviation)').eq('library_id', appUser.library_id);
    const sl = ls?.map((x: any) => x.school).filter(Boolean) || [];
    setSchools(sl);

    const sids = sl.map((s: any) => s.id);
    if (!sids.length) { setRefreshing(false); return; }

    const { data: studs } = await supabase.from('students').select('id').in('school_id', sids);
    const stids = studs?.map((s: any) => s.id) || [];
    if (!stids.length) { setRefreshing(false); return; }

    const { data: ord } = await supabase
      .from('orders')
      .select(`id, status, total_price, created_at, address, phone, location_lat, location_lng, wrapping, driver_id, fourniture_id, notes, student:students(full_name, school:schools(id,name,abbreviation), level:levels(name), class:classes(name)), parent_code:parent_codes(parent_name, parent_phone), items:order_items(item_name, unit_price, quantity), fourniture:fournitures(name, pdf_url, image_url)`)
      .in('student_id', stids).eq('type', 'fourniture').order('created_at', { ascending: false });

    setOrders(ord || []);

    const dids = [...new Set((ord || []).map((o: any) => o.driver_id).filter(Boolean))] as string[];
    if (dids.length) {
      const { data: di } = await supabase.from('app_users').select('id,full_name').in('id', dids);
      const dm: any = {}; di?.forEach((d: any) => { dm[d.id] = d.full_name; });
      setDriverMap(dm);
    }

    const { data: dr } = await supabase.from('app_users').select('id,full_name').eq('role', 'livreur').eq('library_id', appUser.library_id).eq('is_active', true);
    setDrivers(dr || []);
    setRefreshing(false);
  }

  const cnt = (arr: any[]) => ({
    prep: arr.filter(o => o.status === 'en_preparation').length,
    att:  arr.filter(o => o.status === 'en_attente').length,
    liv:  arr.filter(o => o.status === 'livree').length,
    ann:  arr.filter(o => o.status === 'annulee').length,
  });

  const tabStatus: Record<Tab, string> = { prep: 'en_preparation', route: 'en_attente', annulee: 'annulee', livree: 'livree' };
  const tabOrders = orders.filter(o => o.status === tabStatus[tab]);
  const schoolOrders = (sid: string) => tabOrders.filter(o => o.student?.school?.id === sid);
  const niveaux = (sid: string) => [...new Set(schoolOrders(sid).map((o: any) => o.student?.level?.name).filter(Boolean))] as string[];
  const branches = (sid: string, niv: string) => [...new Set(schoolOrders(sid).filter(o => o.student?.level?.name === niv).map((o: any) => o.student?.class?.name).filter(Boolean))] as string[];
  const filteredOrders = (sid: string, niv: string, br: string) => schoolOrders(sid).filter(o => o.student?.level?.name === niv && (!br || o.student?.class?.name === br));

  function goBack() {
    if (subScreen === 'orders') { if (selBranche) { setSelBranche(''); setSubScreen('branche'); } else { setSelNiveau(''); setSubScreen('niveau'); } }
    else if (subScreen === 'branche') { setSelNiveau(''); setSubScreen('niveau'); }
    else if (subScreen === 'niveau') { setSelSchool(null); setSubScreen('school'); }
    else if (subScreen === 'school') { setSubScreen('tabs'); }
  }

  async function changeStatus(orderId: string, newStatus: string) {
    setBusy(true);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setSelOrder((p: any) => p ? { ...p, status: newStatus } : p);
    await load();
    setBusy(false);
  }

  async function doAssign(driverId: string) {
    setBusy(true);
    const ids = isBulk ? bulkIds : [selOrder?.id];
    for (const id of ids) { await supabase.from('orders').update({ driver_id: driverId, status: 'en_attente' }).eq('id', id); }
    await load();
    setShowDriver(false); setShowTicket(false); setIsBulk(false); setBulkIds([]); setBusy(false);
    if (!isBulk) setTab('route');
    if (!isBulk && selOrder) { const driverName = drivers.find(d => d.id === driverId)?.full_name || ''; await generateRecu(selOrder, driverName); }
  }

  // ─── PDF: REÇU THERMIQUE ───
  async function generateRecu(order: any, driverName: string) {
    const dateTirage = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const html = `
      <html><head><meta charset="utf-8"><style>
        * { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; width: 80mm; padding: 16px; color: #1e293b; background: white; }
        .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px; }
        .logo { font-size: 26px; font-weight: 900; color: #0f2356; letter-spacing: -1px; } .logo span { color: #ef4444; }
        .badge { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-top: 8px; }
        .section { margin-bottom: 14px; } .label { font-size: 9px; font-weight: 900; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px; text-transform: uppercase; }
        .val { font-size: 15px; font-weight: 900; color: #0f2356; } .val-sub { font-size: 12px; font-weight: 600; color: #475569; margin-top: 2px; } .val-phone { font-size: 18px; font-weight: 900; color: #2563eb; letter-spacing: 0.5px; }
        .notes-box { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px; border-radius: 0 8px 8px 0; margin-top: 10px; } .notes-txt { font-size: 11px; font-weight: 600; color: #b45309; }
        .divider { border-top: 1px dashed #e2e8f0; margin: 16px 0; }
        .total-box { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
        .total-lbl { font-size: 12px; font-weight: 900; color: #64748b; } .total-val { font-size: 20px; font-weight: 900; color: #0f2356; }
        .driver-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; text-align: center; } .d-lbl { font-size: 10px; font-weight: 900; color: #166534; letter-spacing: 1px; margin-bottom: 4px; } .d-val { font-size: 18px; font-weight: 900; color: #15803d; }
        .cut-line { text-align: center; color: #cbd5e1; font-size: 12px; margin: 20px 0; letter-spacing: 4px; } .footer { text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; line-height: 1.5; }
      </style></head>
      <body>
        <div class="header"><div class="logo">School<span>Box</span></div><div class="badge">BON DE LIVRAISON</div><div style="font-size:10px;color:#64748b;margin-top:6px;font-weight:600;">${dateTirage}</div></div>
        <div class="section"><div class="label">📚 Fourniture</div><div class="val">${order.fourniture?.name || 'Fourniture'}</div></div><div class="divider"></div>
        <div class="section"><div class="label">👨‍🎓 Élève</div><div class="val">${order.student?.full_name || '-'}</div><div class="val-sub">${order.student?.school?.abbreviation || order.student?.school?.name || ''} — ${order.student?.level?.name || ''} ${order.student?.class?.name || ''}</div></div>
        <div class="section"><div class="label">👤 Parent</div><div class="val" style="font-size: 13px;">${order.parent_code?.parent_name || '-'}</div></div>
        <div class="section"><div class="label">📱 Téléphone</div><div class="val-phone">${order.parent_code?.parent_phone || order.phone || '-'}</div></div>
        <div class="section"><div class="label">📍 Adresse</div><div class="val" style="font-size: 13px;">${order.address || '-'}</div></div>
        ${order.notes ? `<div class="notes-box"><div class="label" style="color: #d97706;">💬 Notes</div><div class="notes-txt">${order.notes}</div></div>` : ''}
        <div class="divider"></div>
        <div class="total-box"><div class="total-lbl">TOTAL</div><div class="total-val">${Number(order.total_price).toFixed(2)} MAD</div></div>
        ${order.wrapping ? `<div style="font-size:11px;color:#d97706;font-weight:800;text-align:center;margin-bottom:16px;">🛡️ Protection cahiers incluse</div>` : ''}
        <div class="driver-box"><div class="d-lbl">🚚 LIVREUR ASSIGNÉ</div><div class="d-val">${driverName}</div></div>
        <div class="cut-line">✂ - - - - - - - - -</div>
        <div class="footer">SchoolBox • ${lib?.name || ''}<br/>Merci de votre confiance</div>
      </body></html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Reçu de commande' });
    } catch (e) { Alert.alert('Erreur', 'Impossible de générer le reçu'); }
  }

  // ─── PDF: BONS DE LIVRAISON (2 PAR PAGE) ───
  async function generateBonsPDF() {
    const dateTirage = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Logo Réel yla kan, sinon text
    const logoHtml = sbLogo 
      ? `<img src="${sbLogo}" style="max-height: 32px; max-width: 140px; object-fit: contain;" />` 
      : `<div class="t-logo">School<span>Box</span></div>`;

    let ticketsArray: string[] = [];

    for (const sc of schools) {
      const scOrders = orders.filter(o => o.student?.school?.id === sc.id);
      if (!scOrders.length) continue;
      const nivs = [...new Set(scOrders.map((o: any) => o.student?.level?.name).filter(Boolean))] as string[];
      for (const niv of nivs) {
        const nivOrders = scOrders.filter(o => o.student?.level?.name === niv);
        const brs = [...new Set(nivOrders.map((o: any) => o.student?.class?.name).filter(Boolean))] as string[];
        const groups = brs.length ? brs : [''];
        for (const br of groups) {
          const brOrders = br ? nivOrders.filter(o => o.student?.class?.name === br) : nivOrders;
          if (!brOrders.length) continue;
          brOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          for (const o of brOrders) {
            const driverName = driverMap[o.driver_id] || 'Non assigné';
            const dateCmd = new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            ticketsArray.push(`
              <div class="ticket">
                <div class="watermark">SB</div>
                <div class="t-header">${logoHtml}<div class="t-badge">BON N° ${o.id.toString().slice(0,6).toUpperCase()}</div></div>
                <div class="t-date-row">Cmd du: <b>${dateCmd}</b></div>
                <div class="t-path"><span class="p-tag p-blue">${sc.abbreviation || sc.name}</span><span class="p-arrow">›</span><span class="p-tag p-gray">${niv} ${br}</span></div>
                <div class="info-grid"><div class="info-box"><div class="i-label">👨‍🎓 ÉLÈVE</div><div class="i-val-big">${o.student?.full_name || '-'}</div></div><div class="info-box"><div class="i-label">📱 TÉLÉPHONE</div><div class="i-val-phone">${o.parent_code?.parent_phone || o.phone || '-'}</div></div></div>
                <div class="info-grid"><div class="info-box" style="width: 100%;"><div class="i-label">📦 FOURNITURE</div><div class="i-val">${o.fourniture?.name || '-'}</div></div></div>
                ${o.notes ? `<div class="info-grid" style="margin-bottom: 4px;"><div class="info-box notes-box" style="width: 100%;"><div class="i-label">💬 NOTES / ADRESSE</div><div class="i-val-small">${o.notes} <br/> ${o.address || ''}</div></div></div>` : ''}
                <div class="spacer"></div>
                ${o.wrapping ? `<div class="wrapping-alert">🛡️ Protection cahiers incluse</div>` : ''}
                <div class="t-footer">
                  <div class="d-box"><div class="d-label">🚚 LIVREUR</div><div class="d-name">${driverName}</div></div>
                  <div class="price-box"><div class="price-label">TOTAL À PAYER</div><div class="price-val">${Number(o.total_price).toFixed(2)} MAD</div></div>
                </div>
                <div class="cut-line">✂ - - - - - - - - - - - - - - - - - -</div>
              </div>
            `);
          }
        }
      }
    }

    let finalHtml = '';
    if (ticketsArray.length === 0) {
      finalHtml = `<div class="no-data">📭 Aucun bon de livraison disponible.</div>`;
    } else {
      for (let i = 0; i < ticketsArray.length; i += 2) {
        const t1 = ticketsArray[i];
        const t2 = ticketsArray[i+1] || '';
        finalHtml += `<div class="page-grid">${t1}${t2}</div>`;
      }
    }

    const html = `
      <html><head><meta charset="utf-8">
        <style>
          @page { size: A4 portrait; margin: 10mm; } 
          * { box-sizing: border-box; } body { font-family: Arial, sans-serif; background: #ffffff; color: #1e293b; margin: 0; padding: 0; }
          .page-grid { display: flex; flex-wrap: wrap; gap: 4%; width: 100%; page-break-after: always; margin-bottom: 20px;}
          .ticket { width: 48%; height: 13.6cm; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 16px; position: relative; display: flex; flex-direction: column; background: #ffffff; overflow: hidden; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 140px; font-weight: 900; color: rgba(15, 35, 86, 0.03); z-index: 0; user-select: none; }
          .t-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f2356; padding-bottom: 8px; margin-bottom: 8px; position: relative; z-index: 10; }
          .t-logo { font-size: 20px; font-weight: 900; color: #0f2356; letter-spacing: -0.5px; } .t-logo span { color: #ef4444; }
          .t-badge { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 1px; }
          .t-date-row { font-size: 11px; color: #475569; text-align: right; margin-bottom: 12px; }
          .t-path { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; background: #f8fafc; padding: 8px; border-radius: 8px; position: relative; z-index: 10; }
          .p-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; }
          .p-blue { background: #0f2356; color: white; } .p-gray { background: #e2e8f0; color: #334155; } .p-arrow { color: #94a3b8; font-weight: bold; }
          .info-grid { display: flex; gap: 10px; margin-bottom: 12px; position: relative; z-index: 10; }
          .info-box { flex: 1; border-left: 3px solid #e2e8f0; padding-left: 10px; }
          .i-label { font-size: 9px; font-weight: 900; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px; }
          .i-val-big { font-size: 14px; font-weight: 900; color: #0f2356; } .i-val-phone { font-size: 16px; font-weight: 900; color: #2563eb; letter-spacing: 1px; } .i-val { font-size: 13px; font-weight: 700; color: #334155; }
          .i-val-small { font-size: 11px; font-weight: 600; color: #475569; line-height: 1.4; }
          .notes-box { background: #fffbeb; border-left-color: #f59e0b; padding: 8px 10px; border-radius: 0 8px 8px 0; }
          .wrapping-alert { font-size: 10px; font-weight: 800; color: #d97706; background: #fef3c7; padding: 4px 8px; border-radius: 6px; align-self: flex-start; margin-bottom: 10px; border: 1px solid #fde68a; }
          .spacer { flex-grow: 1; }
          .t-footer { display: flex; justify-content: space-between; align-items: stretch; margin-top: auto; position: relative; z-index: 10; border-top: 1px dashed #e2e8f0; padding-top: 12px; }
          .d-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 10px; flex: 1; margin-right: 10px; display: flex; flex-direction: column; justify-content: center; }
          .d-label { font-size: 9px; font-weight: 900; color: #166534; letter-spacing: 1px; margin-bottom: 2px; } .d-name { font-size: 14px; font-weight: 900; color: #15803d; }
          .price-box { text-align: right; display: flex; flex-direction: column; justify-content: center; }
          .price-label { font-size: 9px; font-weight: 900; color: #64748b; letter-spacing: 1px; } .price-val { font-size: 22px; font-weight: 900; color: #0f2356; }
          .cut-line { text-align: center; color: #cbd5e1; font-size: 10px; font-weight: 600; margin-top: 16px; letter-spacing: 2px; position: relative; z-index: 10; }
          .no-data { text-align: center; font-size: 20px; font-weight: 800; color: #94a3b8; margin-top: 100px; }
        </style>
      </head>
      <body>${finalHtml}</body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Bons de livraison - 2 par page' });
    } catch (e) { Alert.alert('Erreur', 'Impossible de générer les bons'); }
  }

  // ─── PDF: RAPPORT GLOBAL (LOGO REEL) ───
  async function generatePDF() {
    const groups: any = {}; let globalTotalLivree = 0; let totalCommandes = 0; let stats = { prep: 0, att: 0, liv: 0, ann: 0 };
    orders.forEach(o => {
      const dateKey = new Date(o.created_at).toISOString().split('T')[0];
      const st = o.status;
      if (!groups[dateKey]) groups[dateKey] = {}; if (!groups[dateKey][st]) groups[dateKey][st] = [];
      groups[dateKey][st].push(o); totalCommandes++;
      if (st === 'en_preparation') stats.prep++; if (st === 'en_attente') stats.att++; if (st === 'annulee') stats.ann++;
      if (st === 'livree') { stats.liv++; globalTotalLivree += Number(o.total_price || 0); }
    });
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    const orderStatuses = ['en_preparation', 'en_attente', 'livree', 'annulee'];
    let bodyHtml = '';
    
    // Logo Reel f l'entete
    const logoHtml = sbLogo ? `<img src="${sbLogo}" style="max-height: 40px; max-width: 160px; object-fit: contain;" />` : `<div class="logo-box">School<span>Box</span></div>`;

    if (sortedDates.length === 0) { bodyHtml = `<div class="empty-state">📭 Aucune commande trouvée.</div>`; } else {
      for (const dateKey of sortedDates) {
        const displayDate = new Date(dateKey).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        bodyHtml += `<div class="day-card"><div class="day-header"><span class="icon">📅</span><span style="text-transform: capitalize;">${displayDate}</span></div>`;
        let dailyTotal = 0;
        for (const st of orderStatuses) {
          const stOrders = groups[dateKey][st]; if (!stOrders || stOrders.length === 0) continue;
          const stInfo = SC[st]; let stTotal = 0; let rowsHtml = '';
          stOrders.forEach((o: any) => {
            const price = Number(o.total_price || 0); stTotal += price;
            rowsHtml += `<tr><td style="font-weight: 800; color: #0f172a;">${o.student?.full_name || '-'}</td><td>${o.student?.school?.abbreviation || o.student?.school?.name || '-'}</td><td><span class="light-badge">${o.student?.level?.name || '-'} ${o.student?.class?.name || ''}</span></td><td>${o.parent_code?.parent_phone || o.phone || '-'}</td><td>${o.fourniture?.name || '-'}</td><td>${o.driver_id && driverMap[o.driver_id] ? `🚚 ${driverMap[o.driver_id]}` : '-'}</td><td class="price-cell">${price.toFixed(2)} MAD</td></tr>`;
          });
          dailyTotal += stTotal;
          bodyHtml += `<div class="status-section"><div class="status-title" style="background: ${stInfo.bg}; color: ${stInfo.color}; border: 1px solid ${stInfo.border};"><div>${stInfo.emoji} ${stInfo.label.toUpperCase()}</div><div class="status-stats">${stOrders.length} cmd  •  ${stTotal.toFixed(2)} MAD</div></div><table><thead><tr><th>Élève</th><th>École</th><th>Classe</th><th>Téléphone</th><th>Fourniture</th><th>Livreur</th><th style="text-align: right;">Montant</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
        }
        bodyHtml += `<div class="daily-total"><span>Total recette du jour :</span><span class="daily-amount">${dailyTotal.toFixed(2)} MAD</span></div></div>`; 
      }
    }
    const dateTirage = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const html = `
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; } body { font-family: Arial, sans-serif; background-color: #f1f5f9; color: #334155; margin: 0; padding: 0; }
          .page-container { padding: 40px; max-width: 1000px; margin: auto; }
          .hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; padding: 40px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); margin-bottom: -40px; position: relative; z-index: 10; }
          .logo-box { font-size: 38px; font-weight: 900; letter-spacing: -1px; } .logo-box span { color: #ef4444; }
          .lib-name { font-size: 16px; color: #94a3b8; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 8px; }
          .report-info { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: right; }
          .report-title { font-size: 18px; font-weight: 900; color: #38bdf8; letter-spacing: 1px; margin-bottom: 6px; } .report-date { font-size: 13px; color: #cbd5e1; }
          .summary-grid { display: flex; gap: 16px; margin-bottom: 40px; padding-top: 60px; }
          .sum-card { flex: 1; background: white; border-radius: 16px; padding: 24px 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; border-bottom: 4px solid; }
          .sum-card.prep { border-bottom-color: #f59e0b; } .sum-card.att { border-bottom-color: #3b82f6; } .sum-card.liv { border-bottom-color: #10b981; } .sum-card.ann { border-bottom-color: #ef4444; }
          .sum-num { font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 4px; } .sum-lbl { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; }
          .day-card { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
          .day-header { font-size: 20px; font-weight: 900; color: #0f172a; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px dashed #cbd5e1; }
          .status-section { margin-bottom: 24px; } .status-title { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 12px; }
          .status-stats { font-size: 14px; font-weight: 900; } table { width: 100%; border-collapse: separate; border-spacing: 0; } th { background: #f8fafc; padding: 14px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; border-bottom: 2px solid #e2e8f0; }
          td { padding: 14px 10px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f1f5f9; color: #475569; } tr:nth-child(even) td { background-color: #fafafb; } .light-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #475569; } .price-cell { text-align: right; color: #0f172a; font-weight: 900; font-size: 13px; }
          .daily-total { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 16px 20px; border-radius: 14px; font-size: 14px; font-weight: 800; color: #64748b; margin-top: 10px; border: 1px solid #e2e8f0; } .daily-amount { font-size: 20px; font-weight: 900; color: #0f172a; }
          .grand-total { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 24px; padding: 40px; text-align: center; color: white; margin-top: 40px; border: 4px solid #34d399; }
          .gt-label { font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; color: #d1fae5; } .gt-amount { font-size: 48px; font-weight: 900; letter-spacing: -1px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 600; padding-top: 20px; border-top: 2px dashed #cbd5e1; } .empty-state { text-align: center; padding: 60px; font-size: 18px; color: #94a3b8; font-weight: 800; background: white; border-radius: 20px; margin-top: 60px; }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="hero"><div>${logoHtml}<div class="lib-name">📚 ${lib?.name || 'Librairie'} • 👤 ${appUser?.full_name || 'Admin'}</div></div><div class="report-info"><div class="report-title">RAPPORT STATISTIQUE</div><div class="report-date">Généré le : ${dateTirage}</div></div></div>
          <div class="summary-grid"><div class="sum-card prep"><div class="sum-num" style="color: #d97706;">${stats.prep}</div><div class="sum-lbl">⏳ En prépa</div></div><div class="sum-card att"><div class="sum-num" style="color: #2563eb;">${stats.att}</div><div class="sum-lbl">🚚 En route</div></div><div class="sum-card liv"><div class="sum-num" style="color: #059669;">${stats.liv}</div><div class="sum-lbl">✅ Livrées</div></div><div class="sum-card ann"><div class="sum-num" style="color: #dc2626;">${stats.ann}</div><div class="sum-lbl">❌ Annulées</div></div></div>
          ${bodyHtml}
          <div class="grand-total"><div class="gt-label">🏆 Total Recette Net (Commandes Livrées)</div><div class="gt-amount">${globalTotalLivree.toFixed(2)} MAD</div></div>
          <div class="footer">Document officiel SchoolBox — Propriété de ${lib?.name || 'la librairie'}</div>
        </div>
      </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Rapport Statistiques' });
    } catch (e) { Alert.alert('Erreur', 'Impossible de générer le PDF'); }
  }

  function openBulk(arr: any[]) {
    const prep = arr.filter(o => o.status === 'en_preparation').map((o: any) => o.id);
    if (!prep.length) { Alert.alert('Info', 'Aucune commande en préparation'); return; }
    setBulkIds(prep); setIsBulk(true); setShowDriver(true);
  }

  function fmt(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }

  function callParent(phone: string) {
    Alert.alert('Contacter le parent', phone, [
      { text: '📞 Appel normal', onPress: () => Linking.openURL(`tel:${phone}`) },
      { text: '💬 WhatsApp', onPress: () => Linking.openURL(`whatsapp://send?phone=212${phone.replace(/^0/, '')}`) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  const totCnt = cnt(orders);

  // ── HEADER PREMIUM JDEED W KBIR ──
  const Header = ({ title, sub }: { title: string; sub?: string }) => (
    <View style={s.header}>
      <View style={s.decCircle1} />
      <View style={s.decCircle2} />
      
      <View style={s.headerTop}>
        <View style={s.headerLeft}>
          <View style={s.logoBox}>
            {sbLogo ? <Image source={{ uri: sbLogo }} style={s.logoImg} resizeMode="contain" /> : <Image source={require('../../assets/images/logo.jpg')} style={s.logoImg} resizeMode="contain" />}
          </View>
          <View style={s.headerTitles}>
            <Text style={s.sbName}>SchoolBox</Text>
            <View style={s.libraireBadge}><Text style={s.libraireBadgeTxt}>📚 LIBRAIRE</Text></View>
          </View>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Oui', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth/login' as any); } }])}>
          <IcoLogout s={22} c="#ef4444" />
        </TouchableOpacity>
      </View>

      {subScreen === 'tabs' && (
        <View style={s.greetingRow}>
          <Text style={s.greetingTxt}>{getGreeting()}</Text>
          <Text style={s.nameTxt} numberOfLines={1}>{appUser?.full_name || 'Libraire'}</Text>
        </View>
      )}

      {subScreen !== 'tabs' && (
        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={goBack}><IcoBack s={20} c="white" /></TouchableOpacity>
          <View style={{ flex: 1 }}><Text style={s.navTitle} numberOfLines={1}>{title}</Text>{sub && <Text style={s.navSub}>{sub}</Text>}</View>
          <TouchableOpacity style={s.refreshBtn} onPress={load}><IcoRefresh s={18} c="white" /></TouchableOpacity>
          <TouchableOpacity style={s.homeBtn} onPress={() => { setSubScreen('tabs'); setSelSchool(null); setSelNiveau(''); setSelBranche(''); }}><IcoHome s={18} c="white" /></TouchableOpacity>
        </View>
      )}
    </View>
  );

  const TicketModal = () => {
    const phone = selOrder?.parent_code?.parent_phone || selOrder?.phone; const st = selOrder?.status;
    return (
      <Modal visible={showTicket} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.darkSheet}>
            <View style={s.sheetHandle} />
            {selOrder && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={[s.ticketStatusBar, { borderBottomColor: SC[st]?.color }]}><View style={[s.ticketStatusDot, { backgroundColor: SC[st]?.color }]} /><Text style={[s.ticketStatusLabel, { color: SC[st]?.color }]}>{SC[st]?.emoji}  {SC[st]?.label}</Text><Text style={s.ticketStatusDate}>{fmt(selOrder.created_at)}</Text></View>
                <View style={s.fournitureBanner}>{selOrder.fourniture?.image_url ? <Image source={{ uri: selOrder.fourniture.image_url }} style={s.fournitureImg} resizeMode="cover" /> : <View style={s.fournitureIcon}><Text style={{ fontSize: 30 }}>📦</Text></View>}<View style={{ flex: 1 }}><Text style={s.fournitureName}>{selOrder.fourniture?.name || 'Fourniture'}</Text><Text style={s.fournitureMeta}>{selOrder.items?.length || 0} article(s)  •  {Number(selOrder.total_price).toFixed(2)} MAD</Text></View></View>
                <View style={s.ticketBody}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
  {selOrder.student?.school?.logo_url && selOrder.student.school.logo_url.startsWith('http') ? (
    <Image 
      source={{ uri: selOrder.student.school.logo_url }} 
      style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' }} 
      resizeMode="contain" 
    />
  ) : (
    <Text style={{ fontSize: 16 }}>🏫</Text>
  )}
  <Text style={[s.darkInfoSub, { marginTop: 0 }]}>{selOrder.student?.school?.name}</Text>
</View>
                  <View style={s.darkInfoCard}><View style={s.darkInfoCardHeader}><View style={[s.darkInfoDot, { backgroundColor: BLUE }]} /><Text style={s.darkInfoLabel}>PARENT</Text></View><View style={s.parentRow}><View style={{ flex: 1 }}><Text style={s.darkInfoName}>{selOrder.parent_code?.parent_name}</Text><Text style={s.darkInfoSub}>📱  {phone}</Text>{selOrder.address && <Text style={s.darkInfoSub}>📍  {selOrder.address}</Text>}{selOrder.notes && <Text style={s.darkInfoSub}>💬  {selOrder.notes}</Text>}</View>{phone && (<TouchableOpacity style={s.callBtn} onPress={() => callParent(phone)}><IcoPhone s={18} c="white" /><Text style={s.callBtnTxt}>Appeler</Text></TouchableOpacity>)}</View></View>
                  <View style={s.quickActions}>{selOrder.location_lat && (<TouchableOpacity style={s.qaBtnRed} onPress={() => Linking.openURL(`https://maps.google.com/?q=${selOrder.location_lat},${selOrder.location_lng}`)}><IcoMap s={15} c="white" /><Text style={s.qaBtnTxt}>Google Maps</Text></TouchableOpacity>)}{selOrder.fourniture?.pdf_url && (<TouchableOpacity style={s.qaBtnBlue} onPress={() => Linking.openURL(selOrder.fourniture.pdf_url)}><IcoPDF s={15} c="white" /><Text style={s.qaBtnTxt}>Liste PDF</Text></TouchableOpacity>)}</View>
                  {selOrder.items?.length > 0 && (
                    <View style={s.darkInfoCard}><View style={s.darkInfoCardHeader}><View style={[s.darkInfoDot, { backgroundColor: GOLD }]} /><Text style={s.darkInfoLabel}>ARTICLES</Text></View>
                      {selOrder.items.map((item: any, i: number) => (<View key={i} style={[s.articleRow, i < selOrder.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: BORDER }]}><Text style={s.articleName} numberOfLines={2}>{item.item_name}</Text><View style={s.articleRight}><View style={s.articleQtyBox}><Text style={s.articleQtyTxt}>×{item.quantity}</Text></View><Text style={s.articlePrice}>{Number(item.unit_price * item.quantity).toFixed(2)} MAD</Text></View></View>))}
                      {selOrder.wrapping && (<View style={s.articleRow}><Text style={[s.articleName, { color: GOLD }]}>🛡️ Protection cahiers</Text></View>)}
                    </View>
                  )}
                  <View style={s.totalGoldBar}><Text style={s.totalGoldLbl}>TOTAL</Text><Text style={s.totalGoldAmt}>{Number(selOrder.total_price).toFixed(2)} MAD</Text></View>
                  {selOrder.driver_id && (<View style={s.driverBadge}><Text style={{ fontSize: 18 }}>🚚</Text><Text style={s.driverBadgeTxt}>{driverMap[selOrder.driver_id] || '...'}</Text></View>)}
                  <View style={s.actionsBox}>
                    {st === 'en_preparation' && (<><TouchableOpacity style={s.btnGreen} onPress={() => { setIsBulk(false); setShowDriver(true); }} disabled={busy}><IcoCheck s={17} c="white" /><Text style={s.btnPrimaryTxt}>Confirmer & Assigner livreur</Text></TouchableOpacity><TouchableOpacity style={s.btnRed} onPress={() => Alert.alert('Annuler', 'Confirmer l\'annulation ?', [{ text: 'Non', style: 'cancel' }, { text: 'Oui', style: 'destructive', onPress: () => { changeStatus(selOrder.id, 'annulee'); setShowTicket(false); }}])} disabled={busy}><IcoX s={15} c={RED} /><Text style={s.btnRedTxt}>Annuler la commande</Text></TouchableOpacity></>)}
                    {st === 'en_attente' && (<><TouchableOpacity style={s.btnGold} onPress={() => { setIsBulk(false); setShowDriver(true); }} disabled={busy}><IcoTruck s={17} c={NAV} /><Text style={[s.btnPrimaryTxt, { color: NAV }]}>Changer le livreur</Text></TouchableOpacity><TouchableOpacity style={s.btnGray} onPress={() => Alert.alert('Retour', 'Remettre en préparation ?', [{ text: 'Non', style: 'cancel' }, { text: 'Oui', onPress: () => { changeStatus(selOrder.id, 'en_preparation'); setShowTicket(false); } }])} disabled={busy}><Text style={s.btnGrayTxt}>↩️ Retour en préparation</Text></TouchableOpacity><TouchableOpacity style={s.btnRed} onPress={() => Alert.alert('Annuler', 'Confirmer l\'annulation ?', [{ text: 'Non', style: 'cancel' }, { text: 'Oui', style: 'destructive', onPress: () => { changeStatus(selOrder.id, 'annulee'); setShowTicket(false); } }])} disabled={busy}><IcoX s={15} c={RED} /><Text style={s.btnRedTxt}>Annuler</Text></TouchableOpacity></>)}
                    {st === 'annulee' && (<TouchableOpacity style={s.btnGray} onPress={() => Alert.alert('Restaurer', 'Remettre en préparation ?', [{ text: 'Non', style: 'cancel' }, { text: 'Oui', onPress: () => { changeStatus(selOrder.id, 'en_preparation'); setShowTicket(false); } }])} disabled={busy}><Text style={s.btnGrayTxt}>↩️ Annuler l'annulation</Text></TouchableOpacity>)}
                  </View>
                  <TouchableOpacity style={s.btnClose} onPress={() => setShowTicket(false)}><Text style={s.btnCloseTxt}>Fermer</Text></TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const DriverModal = () => {
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    return (
      <Modal visible={showDriver} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.darkSheet, { maxHeight: '65%' }]}>
            <View style={s.sheetHandle} />
            <View style={s.driverModalHead}><Text style={s.driverModalTitle}>🚚  Choisir un livreur</Text>{isBulk && <View style={s.goldBadge}><Text style={s.goldBadgeTxt}>{bulkIds.length} cmd</Text></View>}</View>
            {!selectedDriver ? (<>{drivers.length === 0 ? <View style={s.noDriver}><Text style={s.noDriverTxt}>⚠️  Aucun livreur disponible</Text></View> : <ScrollView style={{ paddingHorizontal: 20 }}>{drivers.map(d => (<TouchableOpacity key={d.id} style={s.driverItem} onPress={() => setSelectedDriver(d)} activeOpacity={0.85}><View style={s.driverAvatar}><Text style={s.driverAvatarTxt}>{d.full_name[0].toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.driverName}>{d.full_name}</Text><Text style={s.driverRole}>Livreur</Text></View><IcoChevron s={16} c={PURPLE} /></TouchableOpacity>))}</ScrollView>}<TouchableOpacity style={[s.btnClose, { marginHorizontal: 20, marginTop: 8 }]} onPress={() => { setShowDriver(false); setIsBulk(false); }}><Text style={s.btnCloseTxt}>Fermer</Text></TouchableOpacity></>) : (<View style={{ paddingHorizontal: 20 }}><View style={s.confirmDriverCard}><View style={s.driverAvatar}><Text style={s.driverAvatarTxt}>{selectedDriver.full_name[0].toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.driverName}>{selectedDriver.full_name}</Text><Text style={s.driverRole}>Livreur sélectionné</Text></View><TouchableOpacity onPress={() => setSelectedDriver(null)} style={s.changeDriverBtn}><Text style={s.changeDriverTxt}>Changer</Text></TouchableOpacity></View><Text style={s.confirmInfo}>{isBulk ? `${bulkIds.length} commandes seront envoyées à ce livreur` : 'Cette commande sera envoyée à ce livreur'}</Text><TouchableOpacity style={s.btnValider} onPress={() => { doAssign(selectedDriver.id); setSelectedDriver(null); }} disabled={busy}>{busy ? <ActivityIndicator color="white" /> : <><IcoCheck s={20} c="white" /><Text style={s.btnValiderTxt}>Valider</Text></>}</TouchableOpacity><TouchableOpacity style={[s.btnClose, { marginTop: 10 }]} onPress={() => { setShowDriver(false); setIsBulk(false); setSelectedDriver(null); }}><Text style={s.btnCloseTxt}>Annuler</Text></TouchableOpacity></View>)}
            <View style={{ height: 24 }} />
          </View>
        </View>
      </Modal>
    );
  };

  const OrderCard = ({ order }: { order: any }) => (
    <TouchableOpacity style={s.orderCard} onPress={() => { setSelOrder(order); setShowTicket(true); }} activeOpacity={0.85}>
      <View style={[s.orderCardStripe, { backgroundColor: SC[order.status]?.color }]} />
      <View style={{ flex: 1, padding: 14 }}>
        <View style={s.orderCardTop}><Text style={s.orderCardName} numberOfLines={1}>{order.student?.full_name}</Text><View style={[s.statusChip, { backgroundColor: SC[order.status]?.bg, borderColor: SC[order.status]?.border }]}><Text style={[s.statusChipTxt, { color: SC[order.status]?.color }]}>{SC[order.status]?.emoji} {SC[order.status]?.label}</Text></View></View>
        <Text style={s.orderCardDate}>{fmt(order.created_at)}</Text>
        <View style={s.orderCardMeta}><Text style={s.orderCardMetaTxt}>👤 {order.parent_code?.parent_name}</Text>{order.location_lat && <Text style={[s.orderCardMetaTxt, { color: RED }]}>📍 GPS</Text>}{order.fourniture?.pdf_url && <Text style={[s.orderCardMetaTxt, { color: BLUE }]}>📄 PDF</Text>}{order.phone && (<TouchableOpacity onPress={() => callParent(order.phone)} style={s.miniCallBtn}><IcoPhone s={11} c={GREEN} /><Text style={s.miniCallTxt}>Appeler</Text></TouchableOpacity>)}</View>
        <View style={s.orderCardFoot}>{order.driver_id ? <View style={s.driverMiniChip}><Text style={s.driverMiniTxt}>🚚 {driverMap[order.driver_id] || '...'}</Text></View> : <View />}<Text style={s.orderCardPrice}>{Number(order.total_price).toFixed(2)} MAD</Text></View>
      </View>
    </TouchableOpacity>
  );

  const BulkBtn = ({ arr }: { arr: any[] }) => {
    const n = arr.filter(o => o.status === 'en_preparation').length;
    if (!n) return null;
    return (<TouchableOpacity style={s.bulkBtn} onPress={() => openBulk(arr)} activeOpacity={0.85}><View style={s.bulkBtnLeft}><IcoTruck s={16} c={GOLD} /></View><Text style={s.bulkBtnTxt}>Envoyer {n} commande{n > 1 ? 's' : ''} au livreur</Text><View style={s.bulkBtnCount}><Text style={s.bulkBtnCountTxt}>{n}</Text></View></TouchableOpacity>);
  };

  const TABS = [
    { key: 'prep',    label: 'En prépa',  icon: <IcoClock s={24} c={GOLD} />, color: GOLD,  count: totCnt.prep, bg: 'rgba(245,158,11,0.12)' },
    { key: 'route',   label: 'En route',  icon: <IcoTruck s={24} c={BLUE} />, color: BLUE,  count: totCnt.att,  bg: 'rgba(59,130,246,0.12)' },
    { key: 'livree',  label: 'Livrées',   icon: <IcoCheckCircle s={24} c={GREEN} />, color: GREEN, count: totCnt.liv,  bg: 'rgba(16,185,129,0.12)' },
    { key: 'annulee', label: 'Annulées',  icon: <IcoCancelCircle s={24} c={RED} />, color: RED,   count: totCnt.ann,  bg: 'rgba(239,68,68,0.12)' },
  ];

  if (subScreen === 'school' || subScreen === 'niveau' || subScreen === 'branche' || subScreen === 'orders') {
    const curSchoolOrders = selSchool ? schoolOrders(selSchool.id) : [];
    const curNiveaux = selSchool ? niveaux(selSchool.id) : [];
    const curBranches = selSchool && selNiveau ? branches(selSchool.id, selNiveau) : [];
    const curOrders = selSchool && selNiveau ? filteredOrders(selSchool.id, selNiveau, selBranche) : [];
    let title = ''; let sub = '';
    if (subScreen === 'school') { title = TABS.find(t => t.key === tab)?.label || ''; sub = `${tabOrders.length} commandes`; }
    if (subScreen === 'niveau') { title = selSchool?.name; sub = `${curSchoolOrders.length} commandes`; }
    if (subScreen === 'branche') { title = selNiveau; sub = `${curSchoolOrders.filter(o => o.student?.level?.name === selNiveau).length} commandes`; }
    if (subScreen === 'orders') { title = selBranche || selNiveau; sub = `${curOrders.length} commandes`; }

    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={NAV} />
        <Header title={title} sub={sub} />
        <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={PURPLE} />} showsVerticalScrollIndicator={false}>
          {subScreen === 'school' && (<>{tab === 'prep' && <BulkBtn arr={tabOrders} />}<Text style={s.secTitle}>🏫  ÉCOLES</Text>{schools.filter(sc => schoolOrders(sc.id).length > 0).map(sc => { const so = schoolOrders(sc.id); const sc2 = cnt(so); return (<TouchableOpacity key={sc.id} style={s.schoolCard} onPress={() => { setSelSchool(sc); setSubScreen('niveau'); }} activeOpacity={0.85}><View style={s.schoolGlow} /><View style={s.schoolIconBox}><Text style={{ fontSize: 28 }}>🏫</Text></View><View style={{ flex: 1 }}><Text style={s.schoolCardName}>{sc.name}</Text>{sc.abbreviation && <Text style={s.schoolCardAbbr}>{sc.abbreviation}</Text>}<MiniBadges c={sc2} /></View><View style={s.arrowBox}><IcoChevron s={16} c={PURPLE} /></View></TouchableOpacity>); })}</>)}
          {subScreen === 'niveau' && selSchool && (<>{tab === 'prep' && <BulkBtn arr={curSchoolOrders} />}<Text style={s.secTitle}>📚  NIVEAUX</Text>{curNiveaux.map(niv => { const no = curSchoolOrders.filter(o => o.student?.level?.name === niv); const nc = cnt(no); const brs = branches(selSchool.id, niv); return (<TouchableOpacity key={niv} style={s.niveauCard} onPress={() => { setSelNiveau(niv); setSubScreen(brs.length ? 'branche' : 'orders'); }} activeOpacity={0.85}><View style={s.niveauBox}><Text style={s.niveauTxt}>{niv}</Text></View><View style={{ flex: 1 }}><Text style={s.niveauMeta}>{brs.length} branche{brs.length !== 1 ? 's' : ''}  •  {no.length} cmd</Text><MiniBadges c={nc} /></View><IcoChevron s={16} c={TEXT3} /></TouchableOpacity>); })}</>)}
          {subScreen === 'branche' && selSchool && selNiveau && (<>{tab === 'prep' && <BulkBtn arr={curSchoolOrders.filter(o => o.student?.level?.name === selNiveau)} />}<Text style={s.secTitle}>📂  BRANCHES</Text>{curBranches.map(br => { const bo = filteredOrders(selSchool.id, selNiveau, br); const bc = cnt(bo); return (<TouchableOpacity key={br} style={s.brancheCard} onPress={() => { setSelBranche(br); setSubScreen('orders'); }} activeOpacity={0.85}><View style={s.brancheIconBox}><Text style={{ fontSize: 22 }}>📘</Text></View><View style={{ flex: 1 }}><Text style={s.brancheTitle}>{br}</Text><Text style={s.brancheMeta}>{bo.length} commande{bo.length !== 1 ? 's' : ''}</Text><MiniBadges c={bc} /></View><IcoChevron s={16} c={TEXT3} /></TouchableOpacity>); })}</>)}
          {subScreen === 'orders' && (<>{tab === 'prep' && <BulkBtn arr={curOrders} />}{curOrders.length === 0 ? <View style={s.empty}><Text style={{ fontSize: 52 }}>📭</Text><Text style={s.emptyTxt}>Aucune commande</Text></View> : curOrders.map(o => <OrderCard key={o.id} order={o} />)}</>)}
          <View style={{ height: 32 }} />
        </ScrollView>
        <TicketModal />
        <DriverModal />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />
      <Header title="" />
      
      <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={PURPLE} />} showsVerticalScrollIndicator={false}>
        
        {/* CARTE TOTAL RECETTE (White box with red line, independent from header) */}
        <View style={s.recetteCardWhite}>
          <View style={s.recetteHeader}>
            <View style={s.recetteLblWrapper}>
              <View style={s.recetteIconBox}><Text style={{fontSize:14}}>💰</Text></View>
              <Text style={s.recetteLbl}>TOTAL RECETTE</Text>
            </View>
          </View>
          <View style={s.recetteAmtRow}>
            <Text style={s.recetteNum}>
              {orders.filter(o => o.status === 'livree').reduce((sum, o) => sum + Number(o.total_price || 0), 0).toFixed(2)}
            </Text>
            <Text style={s.recetteCurrency}> MAD</Text>
          </View>
        </View>

        {/* 2 BOUTONS PDF B L'BYED W L'KHET F JNEB */}
        <View style={s.btnActionsRow}>
          <TouchableOpacity style={[s.btnActionWhite, { borderLeftColor: PURPLE }]} onPress={generatePDF} activeOpacity={0.85}>
            <IcoPDF s={20} c={PURPLE} />
            <Text style={s.btnActionTxt}>Rapport Global</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnActionWhite, { borderLeftColor: RED }]} onPress={generateBonsPDF} activeOpacity={0.85}>
            <IcoTruck s={20} c={RED} />
            <Text style={s.btnActionTxt}>Bons de livraison</Text>
          </TouchableOpacity>
        </View>

        {/* 4 CASES */}
        <View style={s.sectionHeader}>
          <View style={s.sectionLine} />
          <Text style={s.secTitle}>Tableau de bord</Text>
        </View>

        <View style={s.casesGrid}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} style={[s.cardPremium, { borderColor: t.color }]}
              onPress={() => { setTab(t.key as Tab); setSubScreen('school'); setSelSchool(null); setSelNiveau(''); setSelBranche(''); }}
              activeOpacity={0.85}>
              <View style={s.cardTop}>
                <View style={[s.cardIconBox, { backgroundColor: t.bg }]}>{t.icon}</View>
              </View>
              <View style={s.cardBottom}>
                <Text style={[s.cardNum, { color: t.color }]}>{t.count}</Text>
                <Text style={s.cardText}>{t.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <DriverModal />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  
  // --- HEADER VIP (Zre9 kbir habet) ---
  header: { backgroundColor: NAV, paddingTop: 60, paddingBottom: 60, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  decCircle1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 80 },
  decCircle2: { position: 'absolute', bottom: -60, left: -20, width: 140, height: 140, backgroundColor: 'rgba(59,130,246,0.06)', borderRadius: 70 },
  
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { width: 64, height: 64, backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logoImg: { width: '80%', height: '80%' },
  headerTitles: { justifyContent: 'center' },
  sbName: { fontSize: 20, fontWeight: '900', color: 'white' },
  libraireBadge: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3, alignSelf: 'flex-start' },
  libraireBadgeTxt: { fontSize: 9, fontWeight: '800', color: 'white', letterSpacing: 1 },
  
  logoutBtn: { width: 44, height: 44, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  greetingRow: { flexDirection: 'column', alignItems: 'flex-start', marginTop: 28 },
  greetingTxt: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  nameTxt: { fontSize: 28, fontWeight: '900', color: 'white', letterSpacing: -0.5 },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  refreshBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  homeBtn: { width: 40, height: 40, backgroundColor: PURPLE, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  navSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },

  scroll: { padding: 16 },

  // --- CARTE RECETTE BLANCHE AVEC BORDURE ROUGE ---
  recetteCardWhite: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 1, // Tl3at chwya foq zre9 bash tban design 3D
    borderLeftWidth: 5,
    borderLeftColor: RED,
    shadowColor: NAV,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderTopColor: BORDER,
    borderRightColor: BORDER,
    borderBottomColor: BORDER,
  },
  recetteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recetteLblWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recetteIconBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 6, borderRadius: 8 },
  recetteLbl: { fontSize: 11, fontWeight: '800', color: TEXT2, letterSpacing: 1 },
  recetteAmtRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  recetteNum: { fontSize: 32, fontWeight: '900', color: NAV, letterSpacing: -0.5 },
  recetteCurrency: { fontSize: 16, color: RED, fontWeight: '800' },

  // --- BOUTONS PDF B L'BYED ---
  btnActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  btnActionWhite: { flex: 1, backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: NAV, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderLeftWidth: 4 },
  btnActionTxt: { color: NAV, fontWeight: '800', fontSize: 13 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLine: { width: 4, height: 16, backgroundColor: PURPLE, borderRadius: 2 },
  secTitle: { fontSize: 16, fontWeight: '900', color: NAV },

  casesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardPremium: { width: (W - 42) / 2, backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: NAV, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderBottomWidth: 3 },
  cardTop: { marginBottom: 10 },
  cardIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardBottom: { alignItems: 'flex-start' },
  cardNum: { fontSize: 24, fontWeight: '900', marginBottom: 0 },
  cardText: { fontSize: 10, fontWeight: '800', color: TEXT2, textTransform: 'uppercase' },

  // --- STYLES ÉCOLES, NIVEAUX, BRANCHES, ORDERS ---
  schoolCard: { backgroundColor: 'white', borderRadius: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(20,37,90,0.08)', shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  schoolGlow: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, backgroundColor: 'rgba(26,50,133,0.06)', borderRadius: 50 },
  schoolIconBox: { width: 56, height: 56, backgroundColor: '#eef2ff', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  schoolCardName: { fontSize: 15, fontWeight: '900', color: NAV },
  schoolCardAbbr: { fontSize: 11, color: PURPLE, fontWeight: '800', marginBottom: 2 },
  arrowBox: { width: 32, height: 32, backgroundColor: '#eef2ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  niveauCard: { backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(20,37,90,0.08)' },
  niveauBox: { backgroundColor: NAV, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, minWidth: 64, alignItems: 'center' },
  niveauTxt: { fontSize: 14, fontWeight: '900', color: 'white' },
  niveauMeta: { fontSize: 12, color: TEXT2, fontWeight: '700', marginBottom: 2 },

  brancheCard: { backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(20,37,90,0.08)' },
  brancheIconBox: { width: 48, height: 48, backgroundColor: '#eef2ff', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  brancheTitle: { fontSize: 15, fontWeight: '900', color: NAV },
  brancheMeta: { fontSize: 12, color: TEXT2, fontWeight: '600' },

  bulkBtn: { backgroundColor: 'white', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  bulkBtnLeft: { width: 36, height: 36, backgroundColor: '#fff7ed', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bulkBtnTxt: { flex: 1, fontSize: 13, fontWeight: '800', color: GOLD },
  bulkBtnCount: { backgroundColor: GOLD, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  bulkBtnCountTxt: { fontSize: 12, fontWeight: '900', color: '#1a1a00' },

  orderCard: { backgroundColor: 'white', borderRadius: 16, marginBottom: 10, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(20,37,90,0.08)' },
  orderCardStripe: { width: 4 },
  orderCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  orderCardName: { fontSize: 14, fontWeight: '900', color: NAV, flex: 1, marginRight: 8 },
  orderCardDate: { fontSize: 10, color: TEXT3, fontWeight: '600', marginBottom: 5 },
  orderCardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 7 },
  orderCardMetaTxt: { fontSize: 11, color: TEXT2, fontWeight: '600' },
  orderCardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderCardPrice: { fontSize: 15, fontWeight: '900', color: GOLD },
  statusChip: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1 },
  statusChipTxt: { fontSize: 10, fontWeight: '900' },
  driverMiniChip: { backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(26,50,133,0.2)' },
  driverMiniTxt: { fontSize: 11, color: PURPLE, fontWeight: '800' },
  miniCallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ecfdf5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  miniCallTxt: { fontSize: 10, color: GREEN, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyTxt: { fontSize: 16, fontWeight: '800', color: TEXT3 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  darkSheet: { backgroundColor: 'white', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '95%', borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(20,37,90,0.12)' },
  sheetHandle: { width: 44, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginTop: 12 },

  ticketStatusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(20,37,90,0.08)' },
  ticketStatusDot: { width: 10, height: 10, borderRadius: 5 },
  ticketStatusLabel: { flex: 1, fontSize: 16, fontWeight: '900' },
  ticketStatusDate: { fontSize: 11, color: TEXT3, fontWeight: '600' },
  fournitureBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: 'rgba(20,37,90,0.08)' },
  fournitureImg: { width: 56, height: 56, borderRadius: 14 },
  fournitureIcon: { width: 56, height: 56, backgroundColor: '#eef2ff', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fournitureName: { fontSize: 16, fontWeight: '900', color: NAV, marginBottom: 4 },
  fournitureMeta: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  ticketBody: { padding: 18 },
  darkInfoCard: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(20,37,90,0.08)' },
  darkInfoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  darkInfoDot: { width: 8, height: 8, borderRadius: 4 },
  darkInfoLabel: { fontSize: 10, fontWeight: '900', color: TEXT3, letterSpacing: 1.5 },
  darkInfoName: { fontSize: 15, fontWeight: '900', color: NAV, marginBottom: 6 },
  darkInfoSub: { fontSize: 12, color: TEXT2, marginTop: 4, fontWeight: '600' },
  parentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  callBtn: { backgroundColor: GREEN, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  callBtnTxt: { fontSize: 12, fontWeight: '900', color: 'white' },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  qaBtnRed: { flex: 1, backgroundColor: RED, borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  qaBtnBlue: { flex: 1, backgroundColor: '#1d4ed8', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  qaBtnTxt: { color: 'white', fontWeight: '900', fontSize: 13 },
  articleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  articleName: { flex: 1, fontSize: 13, color: NAV, fontWeight: '700' },
  articleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  articleQtyBox: { backgroundColor: '#eef2ff', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(26,50,133,0.2)' },
  articleQtyTxt: { fontSize: 12, color: PURPLE, fontWeight: '900' },
  articlePrice: { fontSize: 13, fontWeight: '900', color: GOLD, minWidth: 72, textAlign: 'right' as any },
  totalGoldBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7ed', borderRadius: 14, padding: 16, marginTop: 4, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a' },
  totalGoldLbl: { fontSize: 12, fontWeight: '900', color: TEXT3, letterSpacing: 1 },
  totalGoldAmt: { fontSize: 22, fontWeight: '900', color: GOLD },
  driverBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#eef2ff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(26,50,133,0.2)' },
  driverBadgeTxt: { fontSize: 14, color: PURPLE, fontWeight: '800' },
  actionsBox: { gap: 10, marginBottom: 10, marginTop: 4 },
  btnPurple: { backgroundColor: PURPLE, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnGreen: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnGold: { backgroundColor: '#fbbf24', borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnGray: { backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  btnGrayTxt: { color: TEXT2, fontWeight: '800', fontSize: 14 },
  btnPrimaryTxt: { color: 'white', fontWeight: '900', fontSize: 15 },
  btnRed: { backgroundColor: 'rgba(229,62,62,0.1)', borderRadius: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(229,62,62,0.3)' },
  btnRedTxt: { color: RED, fontWeight: '800', fontSize: 14 },
  btnClose: { backgroundColor: '#f8fafc', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  btnCloseTxt: { color: TEXT2, fontWeight: '800', fontSize: 14 },

  driverModalHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 14, marginTop: 8 },
  driverModalTitle: { fontSize: 18, fontWeight: '900', color: NAV, flex: 1 },
  goldBadge: { backgroundColor: '#fff7ed', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#fde68a' },
  goldBadgeTxt: { fontSize: 12, fontWeight: '900', color: GOLD },
  noDriver: { backgroundColor: '#fff7ed', borderRadius: 14, padding: 16, marginHorizontal: 20, marginBottom: 14, borderWidth: 1, borderColor: '#fde68a' },
  noDriverTxt: { fontSize: 13, color: GOLD2, fontWeight: '700' },
  driverItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: 'white', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(20,37,90,0.12)' },
  driverAvatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center' },
  driverAvatarTxt: { fontSize: 19, fontWeight: '900', color: 'white' },
  driverName: { fontSize: 15, fontWeight: '900', color: NAV },
  driverRole: { fontSize: 11, color: TEXT3, fontWeight: '600', marginTop: 1 },
  confirmDriverCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(20,37,90,0.12)' },
  changeDriverBtn: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  changeDriverTxt: { fontSize: 12, color: TEXT2, fontWeight: '700' },
  confirmInfo: { fontSize: 13, color: TEXT2, fontWeight: '600', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  btnValider: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnValiderTxt: { color: 'white', fontWeight: '900', fontSize: 16 },
});