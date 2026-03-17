import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions,
  Image, Linking, Modal, Platform, RefreshControl,
  ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const { width: W } = Dimensions.get('window');

// ── PALETTE LIGHT MODE ──
const BG     = '#f6f7fb'; 
const NAV    = '#14255a'; // Header Zre9/K7el
const CARD   = '#ffffff'; 
const BORDER = '#e2e8f0'; 
const GREEN  = '#10b981';
const GOLD   = '#f59e0b';
const RED    = '#ef4444';
const BLUE   = '#3b82f6';
const PURPLE = '#8b5cf6';
const TEXT   = '#0f172a';
const TEXT2  = '#64748b';
const TEXT3  = '#94a3b8';

// ── ICONS SVG ──
function IcoLogout({ s = 18, c = '#fca5a5' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={c} strokeWidth={2} strokeLinecap="round" /><Polyline points="16 17 21 12 16 7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M21 12H9" stroke={c} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IcoCheck({ s = 20, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M20 6L9 17l-5-5" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoPhone({ s = 16, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.37 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012.28 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={c} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IcoBack({ s = 22, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoNavigate({ s = 16, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M3 11l19-9-9 19-2-8-8-2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoPDF({ s = 24, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="14 2 14 8 20 8" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IcoQr({ s = 20, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth={2} /><Rect x="14" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth={2} /><Rect x="3" y="14" width="7" height="7" rx="1" stroke={c} strokeWidth={2} /><Path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" stroke={c} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IcoClose({ s = 24, c = 'white' }: any) { return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth={2.5} strokeLinecap="round" /></Svg>; }

type Screen = 'home' | 'a_livrer' | 'livrees' | 'detail';
type FilterType = 'today' | 'week' | 'month' | 'all';

export default function LivreurHome() {
  const router = useRouter();
  const { appUser, signOut } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [screen, setScreen]               = useState<Screen>('home');
  const [loading, setLoading]             = useState(true);
  const [actionBusy, setActionBusy]       = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const [sbLogo, setSbLogo]               = useState<string | null>(null);
  const [livreurInfo, setLivreurInfo]     = useState<any>(null);
  const [libName, setLibName]             = useState('');
  const [ordersALivrer, setOrdersALivrer] = useState<any[]>([]);
  const [ordersLivrees, setOrdersLivrees] = useState<any[]>([]);
  
  // States Scanner & Détails
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [cameraActive, setCameraActive]   = useState(false);
  const [qrMatched, setQrMatched]         = useState(false);

  // Filtre
  const [dateFilter, setDateFilter]       = useState<FilterType>('today');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadAll();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [appUser]);

  async function loadAll() {
    setRefreshing(true);
    await Promise.all([loadSettings(), loadLivreurInfo()]);
    setLoading(false);
    setRefreshing(false);
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.from('app_settings').select('key,value');
      if (data) {
        const logo = data.find((d: any) => d.key === 'sb_logo_url');
        if (logo?.value?.startsWith('http')) setSbLogo(logo.value);
      }
    } catch {}
  }

  async function loadLivreurInfo() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (!uid) return;
      const { data: userRow } = await supabase.from('app_users').select('*, libraries(name)').eq('auth_id', uid).single();
      if (userRow) {
        setLivreurInfo(userRow);
        setLibName(userRow.libraries?.name || '');
        await loadOrders(userRow.id);
      }
    } catch {}
  }

  async function loadOrders(driverId: string) {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`*, students(full_name, genre), parent_codes(parent_name, parent_phone), fournitures(name)`)
        .eq('driver_id', driverId)
        .in('status', ['en_attente', 'livree'])
        .order('created_at', { ascending: false });
      const all = data || [];
      setOrdersALivrer(all.filter((o: any) => o.status === 'en_attente'));
      setOrdersLivrees(all.filter((o: any) => o.status === 'livree'));
    } catch {}
  }

  // ─── LOGIQUE DE FILTRAGE ───
  const getFilteredOrders = (list: any[]) => {
    if (dateFilter === 'all') return list;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return list.filter(o => {
      // Pour les livrées, on filtre sur la date de livraison, sinon la date de création
      const targetDateStr = (o.status === 'livree' && o.delivered_at) ? o.delivered_at : o.created_at;
      const d = new Date(targetDateStr);
      
      if (dateFilter === 'today') {
        return d >= today;
      }
      if (dateFilter === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        return d >= startOfWeek;
      }
      if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return d >= startOfMonth;
      }
      return true;
    });
  };

  const filteredALivrer = getFilteredOrders(ordersALivrer);
  const filteredLivrees = getFilteredOrders(ordersLivrees);

  // ─── ACTIONS ───
  function callPhone(phone: string) {
    Alert.alert('📞 Contacter le parent', phone, [
      { text: '📞 Appel', onPress: () => Linking.openURL(`tel:${phone}`) },
      { text: '💬 WhatsApp', onPress: () => Linking.openURL(`whatsapp://send?phone=212${phone.replace(/^0/, '')}`) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  function openMap(order: any) {
    const lat = order.location_lat; const lng = order.location_lng; const addr = order.address;
    let url = '';
    if (lat && lng) url = Platform.OS === 'ios' ? `maps:?daddr=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}(Livraison)`;
    else if (addr) url = Platform.OS === 'ios' ? `maps:?daddr=${encodeURIComponent(addr)}` : `geo:0,0?q=${encodeURIComponent(addr)}`;
    else { Alert.alert('Localisation', 'Aucune adresse ni coordonnées disponibles.'); return; }
    Linking.openURL(url).catch(() => {
      if (lat && lng) Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      else if (addr) Linking.openURL(`https://www.google.com/maps/search/?q=${encodeURIComponent(addr)}`);
    });
  }

  // ─── SCANNER QR LOGIQUE ───
  async function openScanner() {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Erreur', 'Permission caméra requise pour scanner le QR.'); return; }
    }
    setCameraActive(true);
  }

  function handleScan(data: string) {
    if (!selectedOrder) return;
    if (data === selectedOrder.qr_code || data === selectedOrder.qr_token) {
      setQrMatched(true);
      setCameraActive(false);
    } else {
      Alert.alert('QR Incorrect', 'Ce QR code ne correspond pas à cette commande. Veuillez vérifier avec le parent.', [
        { text: 'Réessayer', onPress: () => setCameraActive(true) },
        { text: 'Annuler', onPress: () => setCameraActive(false), style: 'cancel' }
      ]);
      setCameraActive(false);
    }
  }

  // ─── VALIDATION LIVRAISON ───
  async function confirmDeliveryDB() {
    setActionBusy(true);
    const { error } = await supabase.from('orders').update({ status: 'livree', delivered_at: new Date().toISOString() }).eq('id', selectedOrder.id);
    if (error) { Alert.alert('Erreur', 'Impossible de confirmer.'); setActionBusy(false); return; }
    if (livreurInfo?.id) await loadOrders(livreurInfo.id);
    setScreen('a_livrer');
    setSelectedOrder(null);
    setQrMatched(false);
    setActionBusy(false);
  }

  // ─── GENERATE PDF RAPPORT LIVREUR ───
  async function generateDriverPDF() {
    const allFiltered = [...filteredALivrer, ...filteredLivrees];
    if (allFiltered.length === 0) { Alert.alert('Vide', 'Aucune commande dans cette période.'); return; }

    const groups: any = {};
    let totalEncaisse = 0; let countLivree = 0; let countAttente = 0;

    allFiltered.forEach(o => {
      const dateStr = o.delivered_at ? o.delivered_at : o.created_at;
      const dateKey = new Date(dateStr).toISOString().split('T')[0];
      const st = o.status;
      if (!groups[dateKey]) groups[dateKey] = { livree: [], en_attente: [] };
      groups[dateKey][st].push(o);
      if (st === 'livree') { countLivree++; totalEncaisse += Number(o.total_price || 0); } 
      else { countAttente++; }
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    let bodyHtml = '';

    for (const dateKey of sortedDates) {
      const displayDate = new Date(dateKey).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      bodyHtml += `<div class="day-card"><div class="day-header">📅 ${displayDate}</div>`;
      let dailyTotal = 0;

      if (groups[dateKey].livree.length > 0) {
        let rowsHtml = '';
        groups[dateKey].livree.forEach((o: any) => {
          const price = Number(o.total_price || 0); dailyTotal += price;
          rowsHtml += `<tr><td><b>${o.students?.full_name || '-'}</b></td><td>${o.parent_codes?.parent_phone || '-'}</td><td>${o.address || 'GPS'}</td><td style="color: #10b981; font-weight: bold;">✅ Livrée</td><td style="text-align: right; font-weight: bold;">${price.toFixed(2)} DH</td></tr>`;
        });
        bodyHtml += `<div class="status-title" style="color: #10b981;">✅ COMMANDES LIVRÉES (${groups[dateKey].livree.length})</div><table><thead><tr><th>Élève</th><th>Téléphone</th><th>Adresse</th><th>Statut</th><th style="text-align: right;">Montant</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
      }
      if (groups[dateKey].en_attente.length > 0) {
        let rowsHtml = '';
        groups[dateKey].en_attente.forEach((o: any) => {
          const price = Number(o.total_price || 0);
          rowsHtml += `<tr><td><b>${o.students?.full_name || '-'}</b></td><td>${o.parent_codes?.parent_phone || '-'}</td><td>${o.address || 'GPS'}</td><td style="color: #f59e0b; font-weight: bold;">🚚 À livrer</td><td style="text-align: right; font-weight: bold;">${price.toFixed(2)} DH</td></tr>`;
        });
        bodyHtml += `<div class="status-title" style="color: #f59e0b; margin-top: 15px;">🚚 COMMANDES À LIVRER (${groups[dateKey].en_attente.length})</div><table><thead><tr><th>Élève</th><th>Téléphone</th><th>Adresse</th><th>Statut</th><th style="text-align: right;">Montant</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
      }
      bodyHtml += `<div class="daily-total">Total encaissé ce jour : <b>${dailyTotal.toFixed(2)} DH</b></div></div>`;
    }

    const dateTirage = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const filtersLabel = { 'today': "Aujourd'hui", 'week': "Cette semaine", 'month': "Ce mois", 'all': "Toutes les dates" };
    
    const html = `
      <html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; } body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 40px; }
        .header { background: #0f2356; border-radius: 16px; padding: 30px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: 900; } .logo span { color: #10b981; } .driver-name { font-size: 20px; font-weight: 800; margin-top: 5px; color: #cbd5e1; }
        .stats-row { display: flex; gap: 15px; margin-bottom: 30px; } .stat-box { flex: 1; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
        .stat-num { font-size: 28px; font-weight: 900; } .stat-lbl { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-top: 5px; }
        .day-card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .day-header { font-size: 18px; font-weight: 900; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 16px; text-transform: capitalize; }
        .status-title { font-size: 13px; font-weight: 900; margin-bottom: 10px; } table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; } td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        .daily-total { text-align: right; background: #ecfdf5; padding: 12px 16px; border-radius: 8px; color: #065f46; font-size: 14px; margin-top: 15px; border: 1px solid #a7f3d0; }
        .grand-total { background: #10b981; border-radius: 16px; padding: 30px; text-align: center; color: white; margin-top: 40px; } .gt-lbl { font-size: 14px; font-weight: 800; letter-spacing: 1px; margin-bottom: 5px; opacity: 0.9; } .gt-val { font-size: 42px; font-weight: 900; }
      </style></head>
      <body>
        <div class="header"><div><div class="logo">School<span>Box</span></div><div class="driver-name">🚚 ${livreurInfo?.full_name || 'Livreur'}</div></div><div style="text-align: right;"><div style="font-size: 16px; font-weight: bold;">Rapport de Livraison</div><div style="font-size: 12px; color: #cbd5e1; margin-top: 5px;">Période : ${filtersLabel[dateFilter]}<br/>Généré le ${dateTirage}</div></div></div>
        <div class="stats-row"><div class="stat-box"><div class="stat-num" style="color: #f59e0b;">${countAttente}</div><div class="stat-lbl">En Attente</div></div><div class="stat-box"><div class="stat-num" style="color: #10b981;">${countLivree}</div><div class="stat-lbl">Livrées</div></div></div>
        ${bodyHtml}
        <div class="grand-total"><div class="gt-lbl">💰 TOTAL ENCAISSÉ (${filtersLabel[dateFilter]})</div><div class="gt-val">${totalEncaisse.toFixed(2)} DH</div></div>
      </body></html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Rapport Livreur' });
    } catch (e) { Alert.alert('Erreur', 'Impossible de générer le rapport'); }
  }

  if (loading) return <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={GREEN} size="large" /></View>;

  /* ══════ DETAIL COMMANDE ══════ */
  if (screen === 'detail' && selectedOrder) {
    const o = selectedOrder;
    const phone = o.parent_codes?.parent_phone || o.phone || '';
    const isLivree = o.status === 'livree';
    const hasLoc = !!(o.location_lat && o.location_lng);
    const hasAddr = !!(o.address);

    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* CAMERA OVERLAY (MODAL) */}
        <Modal visible={cameraActive} animationType="slide" transparent>
          <View style={s.cameraOverlay}>
            <CameraView style={StyleSheet.absoluteFillObject} facing="back" onBarcodeScanned={({ data }) => handleScan(data)} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} />
            <View style={s.cameraUI}>
              <View style={s.cameraFrame} />
              <Text style={s.cameraHint}>Scannez le QR Code de l'élève/parent</Text>
              <TouchableOpacity style={s.cameraCloseBtn} onPress={() => setCameraActive(false)}>
                <IcoClose s={26} c="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => { setScreen(isLivree ? 'livrees' : 'a_livrer'); setSelectedOrder(null); setQrMatched(false); }}>
            <IcoBack s={20} c="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Détails Commande</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
          <View style={[s.statusBadge, { backgroundColor: isLivree ? '#ecfdf5' : '#fffbeb', borderColor: isLivree ? GREEN : GOLD }]}>
            <Text style={[s.statusBadgeTxt, { color: isLivree ? GREEN : GOLD }]}>{isLivree ? '✅ Livrée' : '🚚 À livrer'}</Text>
          </View>

          <View style={s.dCard}>
            <Text style={s.dCardTitle}>👤 Élève</Text>
            <Text style={s.dVal}>{o.students?.full_name || '—'}</Text>
          </View>

          <View style={s.dCard}>
            <Text style={s.dCardTitle}>👨‍👩‍👧 Parent</Text>
            <View style={s.dRow}>
              <Text style={[s.dVal, { flex: 1 }]}>{o.parent_codes?.parent_name || '—'}</Text>
              {!!phone && (
                <TouchableOpacity style={s.callBtn} onPress={() => callPhone(phone)}>
                  <IcoPhone s={14} c="white" />
                  <Text style={s.callBtnTxt}>Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={s.dCard}>
            <Text style={s.dCardTitle}>📍 Localisation</Text>
            {hasLoc && <View style={s.dRow}><Text style={s.dLbl}>GPS</Text><Text style={[s.dVal, { color: BLUE, fontSize: 12, fontFamily: 'monospace' }]}>{Number(o.location_lat).toFixed(5)}, {Number(o.location_lng).toFixed(5)}</Text></View>}
            {hasAddr && <View style={{ marginTop: hasLoc ? 8 : 0 }}><Text style={s.dLbl}>Adresse</Text><Text style={[s.dVal, { marginTop: 4, lineHeight: 20 }]}>{o.address}</Text></View>}
            {!hasLoc && !hasAddr && <Text style={[s.dVal, { color: TEXT3 }]}>Aucune localisation disponible</Text>}
            {(hasLoc || hasAddr) && (<TouchableOpacity style={s.mapsBtn} onPress={() => openMap(o)}><IcoNavigate s={16} c="white" /><Text style={s.mapsBtnTxt}>{hasLoc ? 'Ouvrir dans Maps (GPS)' : 'Ouvrir dans Maps (adresse)'}</Text></TouchableOpacity>)}
          </View>

          <View style={s.dCard}>
            <Text style={s.dCardTitle}>🛍️ Commande</Text>
            <View style={s.dRow}><Text style={s.dLbl}>Type</Text><Text style={s.dVal}>{o.type === 'fourniture' ? '📚 Fourniture' : '🛒 Produit'}</Text></View>
            {o.fournitures?.name && <View style={s.dRow}><Text style={s.dLbl}>Article</Text><Text style={[s.dVal, { flex: 1, textAlign: 'right' }]}>{o.fournitures.name}</Text></View>}
            <View style={s.dRow}><Text style={s.dLbl}>Total</Text><Text style={[s.dVal, { color: GOLD, fontWeight: '900', fontSize: 16 }]}>{Number(o.total_price || 0).toFixed(2)} DH</Text></View>
            {o.wrapping && <View style={s.dRow}><Text style={s.dLbl}>Protection</Text><Text style={[s.dVal, { color: GREEN }]}>✅ Oui</Text></View>}
            {!!o.notes && <View style={{ marginTop: 6, gap: 4 }}><Text style={s.dLbl}>Notes</Text><Text style={[s.dVal, { color: TEXT2 }]}>{o.notes}</Text></View>}
          </View>

          {isLivree && !!o.delivered_at && (
            <View style={s.dCard}>
              <Text style={s.dCardTitle}>📅 Livré le</Text>
              <Text style={[s.dVal, { color: GREEN }]}>
                {new Date(o.delivered_at).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM ACTION BAR */}
        {!isLivree && (
          <View style={s.bottomBar}>
            {!qrMatched ? (
              <TouchableOpacity style={[s.confirmBtn, { backgroundColor: NAV }]} onPress={openScanner}>
                <IcoQr s={20} c="white" />
                <Text style={s.confirmBtnTxt}>Scanner QR pour Confirmer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={s.confirmBtn} onPress={confirmDeliveryDB} disabled={actionBusy}>
                {actionBusy ? <ActivityIndicator color="white" /> : <><IcoCheck s={22} c="white" /><Text style={s.confirmBtnTxt}>Valider la livraison</Text></>}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  /* ══════ ORDERS LIST ══════ */
  if (screen === 'a_livrer' || screen === 'livrees') {
    const isALivrer = screen === 'a_livrer';
    const orders = isALivrer ? filteredALivrer : filteredLivrees;
    const color = isALivrer ? GOLD : GREEN;

    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={[s.topBar, { borderBottomColor: color + '40' }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => setScreen('home')}><IcoBack s={20} c="white" /></TouchableOpacity>
          <Text style={[s.topBarTxt, { color: 'white' }]}>{isALivrer ? '🚚 À livrer' : '✅ Livrées'}</Text>
          <View style={[s.countBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Text style={[s.countBadgeTxt, { color: 'white' }]}>{orders.length}</Text></View>
        </View>

        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll} tintColor={color} />} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
          {orders.length === 0 ? (
            <View style={s.emptyBox}><Text style={{ fontSize: 60 }}>{isALivrer ? '📭' : '📪'}</Text><Text style={s.emptyTxt}>{isALivrer ? 'Aucune commande' : 'Aucune livraison effectuée'}</Text></View>
          ) : orders.map(o => (
            <TouchableOpacity key={o.id} style={s.orderCard} onPress={() => { setSelectedOrder(o); setQrMatched(false); setScreen('detail'); }} activeOpacity={0.85}>
              <View style={[s.orderAccent, { backgroundColor: color }]} />
              <View style={{ flex: 1, gap: 5 }}>
                <View style={s.dRow}><Text style={s.orderStudent}>{o.students?.full_name || '—'}</Text><Text style={[s.orderPrice, { color: GOLD }]}>{Number(o.total_price || 0).toFixed(0)} DH</Text></View>
                <Text style={s.orderParent}>👨‍👩‍👧 {o.parent_codes?.parent_name || '—'}</Text>
                {o.address ? <Text style={[s.orderType, { color: BLUE }]} numberOfLines={1}>📍 {o.address}</Text> : (o.location_lat && o.location_lng) ? <Text style={[s.orderType, { color: BLUE }]}>📍 GPS disponible</Text> : null}
                <View style={s.dRow}><Text style={s.orderType}>{o.type === 'fourniture' ? '📚' : '🛒'} {o.fournitures?.name || o.type}</Text><Text style={s.orderDate}>{new Date(o.created_at).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' })}</Text></View>
              </View>
              {o.parent_codes?.parent_phone && (<TouchableOpacity style={s.phoneBtn} onPress={() => callPhone(o.parent_codes.parent_phone)}><IcoPhone s={16} c="white" /></TouchableOpacity>)}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  /* ══════ HOME ══════ */
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll} tintColor={GREEN} />} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER ZRE9 HABET LTEHT */}
        <Animated.View style={[s.homeHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.homeHeaderTop}>
            <View style={s.sbLogoBox}>
              {sbLogo ? <Image source={{ uri: sbLogo }} style={{ width: 52, height: 52 }} resizeMode="contain" /> : <Text style={{ fontSize: 20, fontWeight: '900', color: NAV }}>SB</Text>}
            </View>
            <View style={{ flex: 1, paddingHorizontal: 14 }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Bonjour 👋</Text>
              <Text style={s.livreurName} numberOfLines={1}>{livreurInfo?.full_name || 'Livreur'}</Text>
              {!!libName && (<View style={s.libBadge}><Text style={s.libBadgeTxt}>📦 {libName}</Text></View>)}
            </View>
            <TouchableOpacity style={s.logoutBtn} onPress={async () => { await signOut(); router.replace('/auth/login' as any); }}>
              <IcoLogout s={16} />
            </TouchableOpacity>
          </View>

          <View style={s.statsRow}>
            <View style={[s.statBox, { borderColor: GOLD + '44' }]}>
              <Text style={[s.statNum, { color: GOLD }]}>{filteredALivrer.length}</Text>
              <Text style={s.statLbl}>À livrer</Text>
              <View style={[s.statDot, { backgroundColor: GOLD }]} />
            </View>
            <View style={[s.statBox, { borderColor: GREEN + '44' }]}>
              <Text style={[s.statNum, { color: GREEN }]}>{filteredLivrees.length}</Text>
              <Text style={s.statLbl}>Livrées</Text>
              <View style={[s.statDot, { backgroundColor: GREEN }]} />
            </View>
          </View>

          {/* NOUVEAU: FILTRES PAR DATE */}
          <View style={s.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[{ id: 'today', label: "Aujourd'hui" }, { id: 'week', label: 'Cette semaine' }, { id: 'month', label: 'Ce mois' }, { id: 'all', label: 'Tous' }].map(f => {
                const isActive = dateFilter === f.id;
                return (
                  <TouchableOpacity key={f.id} style={[s.filterPill, isActive ? s.filterPillActive : s.filterPillInactive]} onPress={() => setDateFilter(f.id as FilterType)}>
                    <Text style={isActive ? s.filterTxtActive : s.filterTxtInactive}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>

        <Animated.View style={[{ paddingHorizontal: 16, gap: 12, marginBottom: 24 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[s.mainBtn, { flex: 1, backgroundColor: '#fffbeb', borderColor: GOLD + '55' }]} onPress={() => setScreen('a_livrer')} activeOpacity={0.85}>
              {filteredALivrer.length > 0 && (<View style={[s.mainBtnBadge, { backgroundColor: GOLD }]}><Text style={s.mainBtnBadgeTxt}>{filteredALivrer.length}</Text></View>)}
              <View style={[s.mainBtnIcon, { backgroundColor: CARD, borderColor: GOLD + '44' }]}><Text style={{ fontSize: 30 }}>🚚</Text></View>
              <Text style={[s.mainBtnLbl, { color: GOLD }]}>À livrer</Text>
              <Text style={s.mainBtnSub}>Commandes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.mainBtn, { flex: 1, backgroundColor: '#ecfdf5', borderColor: GREEN + '55' }]} onPress={() => setScreen('livrees')} activeOpacity={0.85}>
              {filteredLivrees.length > 0 && (<View style={[s.mainBtnBadge, { backgroundColor: GREEN }]}><Text style={s.mainBtnBadgeTxt}>{filteredLivrees.length}</Text></View>)}
              <View style={[s.mainBtnIcon, { backgroundColor: CARD, borderColor: GREEN + '44' }]}><Text style={{ fontSize: 30 }}>✅</Text></View>
              <Text style={[s.mainBtnLbl, { color: GREEN }]}>Livrées</Text>
              <Text style={s.mainBtnSub}>Historique</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.mainBtnFull, { backgroundColor: '#eff6ff', borderColor: BLUE + '55' }]} onPress={generateDriverPDF} activeOpacity={0.85}>
            <View style={[s.mainBtnIcon, { backgroundColor: CARD, borderColor: BLUE + '44' }]}><IcoPDF s={32} c={BLUE} /></View>
            <View>
              <Text style={[s.mainBtnLbl, { color: BLUE }]}>Générer Rapport PDF</Text>
              <Text style={s.mainBtnSub}>Historique et total encaissé</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {filteredALivrer.length > 0 && (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: TEXT, marginBottom: 4 }}>Prochaines livraisons</Text>
            {filteredALivrer.slice(0, 3).map(o => (
              <TouchableOpacity key={o.id} style={s.recentCard} onPress={() => { setSelectedOrder(o); setQrMatched(false); setScreen('detail'); }} activeOpacity={0.85}>
                <View style={[s.recentDot, { backgroundColor: GOLD }]} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={s.orderStudent}>{o.students?.full_name || '—'}</Text>
                  <Text style={[s.orderParent, { color: BLUE }]} numberOfLines={1}>{o.address || (o.location_lat ? '📍 GPS disponible' : '📍 Non définie')}</Text>
                </View>
                <Text style={[s.orderPrice, { color: GOLD }]}>{Number(o.total_price || 0).toFixed(0)} DH</Text>
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
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: NAV, gap: 10 },
  topBarTxt: { flex: 1, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  backBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  countBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  countBadgeTxt: { fontSize: 13, fontWeight: '900' },
  
  homeHeader: { backgroundColor: NAV, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingTop: 56, paddingBottom: 28, paddingHorizontal: 18, marginBottom: 20, shadowColor: NAV, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8 },
  homeHeaderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sbLogoBox: { width: 52, height: 52, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  livreurName: { fontSize: 20, fontWeight: '900', color: 'white', marginTop: 2 },
  libBadge: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 5, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  libBadgeTxt: { fontSize: 11, fontWeight: '700', color: GREEN },
  logoutBtn: { width: 36, height: 36, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, position: 'relative', overflow: 'hidden' },
  statNum: { fontSize: 28, fontWeight: '900' },
  statLbl: { fontSize: 11, color: TEXT2, fontWeight: '700', marginTop: 2 },
  statDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
  
  filterContainer: { marginTop: 20, paddingBottom: 4 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterPillActive: { backgroundColor: 'white', borderColor: 'white' },
  filterPillInactive: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' },
  filterTxtActive: { color: NAV, fontWeight: '900', fontSize: 12 },
  filterTxtInactive: { color: 'white', fontWeight: '600', fontSize: 12 },

  mainBtn: { borderRadius: 20, padding: 18, borderWidth: 1, alignItems: 'center', gap: 8, position: 'relative' },
  mainBtnFull: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 20, padding: 18, borderWidth: 1 },
  mainBtnIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  mainBtnLbl: { fontSize: 15, fontWeight: '900' },
  mainBtnSub: { fontSize: 11, color: TEXT3, fontWeight: '600' },
  mainBtnBadge: { position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  mainBtnBadgeTxt: { fontSize: 12, fontWeight: '900', color: 'white' },
  
  recentCard: { backgroundColor: CARD, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: BORDER },
  recentDot: { width: 10, height: 10, borderRadius: 5 },
  
  orderCard: { backgroundColor: CARD, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  orderAccent: { width: 4, position: 'absolute', left: 0, top: 0, bottom: 0 },
  orderStudent: { fontSize: 14, fontWeight: '900', color: TEXT },
  orderPrice: { fontSize: 14, fontWeight: '900' },
  orderParent: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  orderType: { fontSize: 11, color: TEXT3, fontWeight: '600' },
  orderDate: { fontSize: 11, color: TEXT3 },
  phoneBtn: { width: 40, height: 40, backgroundColor: BLUE, borderRadius: 13, justifyContent: 'center', alignItems: 'center', shadowColor: BLUE, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5 },
  
  emptyBox: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTxt: { fontSize: 15, color: TEXT3, fontWeight: '700' },
  
  statusBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', borderWidth: 1, marginBottom: 14 },
  statusBadgeTxt: { fontSize: 13, fontWeight: '900' },
  
  dCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: BORDER, marginBottom: 12 },
  dCardTitle: { fontSize: 11, color: TEXT3, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  dRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  dLbl: { fontSize: 12, color: TEXT3, fontWeight: '600' },
  dVal: { fontSize: 14, color: TEXT, fontWeight: '700' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#a7f3d0' },
  callBtnTxt: { fontSize: 12, color: GREEN, fontWeight: '700' },
  mapsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: BLUE, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 10, alignSelf: 'flex-start', shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  mapsBtnTxt: { fontSize: 13, color: 'white', fontWeight: '800' },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: CARD, borderTopWidth: 1, borderTopColor: BORDER },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  confirmBtnTxt: { fontSize: 16, fontWeight: '900', color: 'white' },

  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  cameraUI: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: 260, height: 260, borderWidth: 2, borderColor: GOLD, borderRadius: 24, backgroundColor: 'transparent' },
  cameraHint: { color: 'white', fontSize: 16, fontWeight: '700', marginTop: 30, textAlign: 'center', paddingHorizontal: 40 },
  cameraCloseBtn: { position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20 },
});