import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';

// ── CONSTANTS ──────────────────────────────────────
const NAV = '#0f2356';
const NAV2 = '#1a3285';
const RED = '#e53e3e';

const SCHOOL_TYPES: Record<string, { label: string; niveaux: string[] }> = {
  Maternelle: { label: 'Maternelle', niveaux: ['PS', 'MS', 'GS'] },
  Primaire: { label: 'Primaire', niveaux: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'CE6'] },
  College: { label: 'Collège', niveaux: ['1AC', '2AC', '3AC'] },
  Lycee: { label: 'Lycée', niveaux: ['TC', '1BAC', '2BAC'] },
};

const NIVEAU_BRANCHES: Record<string, string[]> = {
  'TC': ['Sciences', 'Lettres et Sciences Humaines'],
  '1BAC': ['Sciences X', 'Sciences Math', 'Sciences Économiques', 'Lettres et Sciences Humaines'],
  '2BAC': ['Math', 'Physique', 'SVT', 'Économie', 'Gestion', 'Lettres et Sciences Humaines'],
};

const TYPE_KEY_MAP: Record<string, string> = {
  'Maternelle': 'Maternelle', 'Primaire': 'Primaire',
  'Collège': 'College', 'College': 'College',
  'Lycée': 'Lycee', 'Lycee': 'Lycee',
};

// ── ICONS ──────────────────────────────────────────
function IconBack({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconSearch({ size = 18, color = '#6b7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconStats({ size = 18, color = '#6b7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconWhatsApp({ size = 18, color = '#25D366' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconPDF({ size = 18, color = RED }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M9 13h6M9 17h4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconImport({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="7 10 12 15 17 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconTrash({ size = 16, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconExcel({ size = 16, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M7 8l3 4-3 4M13 8h4M13 12h4M13 16h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconMsg({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconImage({ size = 18, color = NAV }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={2} />
      <Circle cx="8.5" cy="8.5" r="1.5" stroke={color} strokeWidth={2} />
      <Polyline points="21 15 16 10 5 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── HELPERS ────────────────────────────────────────
function generateCode(): string {
  return 'SB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pass = 'SB-';
  for (let i = 0; i < 4; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  pass += '-';
  for (let i = 0; i < 4; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}
function getAvatar(name: string): string {
  const n = name?.trim().toLowerCase() || '';
  const femaleNames = ['salma','nadia','sara','lina','rim','hiba','imane','ghita','nour','asmae','zineb','fatima','aicha','khadija','leila','naima','souad','amina','hafsa','meryem','yasmine','laila','rajae','houda','siham','widad','samira','hanae','ikram','assia'];
  return femaleNames.some(fn => n.startsWith(fn)) ? '👧' : '👦';
}
function formatPhone(phone: string): string {
  let p = phone.toString().replace(/\s/g,'').replace(/[-().]/g,'');
  if (p.startsWith('00212')) p = p.substring(2);
  else if (p.startsWith('0')) p = '212' + p.substring(1);
  else if (p.startsWith('+')) p = p.substring(1);
  else if (!p.startsWith('212')) p = '212' + p;
  return p;
}

// ── PDF ────────────────────────────────────────────
async function generatePDF(students: any[], schoolName: string) {
  try {
    const groups: Record<string, any[]> = {};
    for (const s of students) {
      const key = s.niveau || 'Autre';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    let pagesHTML = '';
    for (const [niveau, niveauStudents] of Object.entries(groups)) {
      let cardsHTML = '';
      for (const s of niveauStudents) {
        const code = s.code || '';
        const password = s.password || '';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(code)}&format=png`;
        cardsHTML += `
          <div class="card">
            <img src="${qrUrl}" class="qr" />
            <div class="card-info">
              <div class="student-name">${s.full_name}</div>
              <div class="classe">${s.classe || ''}</div>
              <div class="row"><span class="label">Code</span><span class="code">${code}</span></div>
              <div class="row"><span class="label">Mot de passe</span><span class="pass">${password}</span></div>
            </div>
          </div>`;
      }
      pagesHTML += `
        <div class="page">
          <div class="page-header">
            <div class="school-title">${schoolName}</div>
            <div class="niveau-title">${niveau}</div>
            <div class="count">${niveauStudents.length} élèves</div>
          </div>
          <div class="grid">${cardsHTML}</div>
        </div>`;
    }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Arial,sans-serif;background:white}
        .page{page-break-after:always;padding:24px;min-height:100vh}
        .page:last-child{page-break-after:auto}
        .page-header{text-align:center;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #1a3285}
        .school-title{font-size:13px;color:#6b7280;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .niveau-title{font-size:28px;font-weight:900;color:#0f2356;margin-bottom:4px}
        .count{font-size:13px;color:#1a3285;font-weight:600}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .card{display:flex;flex-direction:row;align-items:center;gap:10px;background:white;border:1.5px solid #e5e7eb;border-radius:10px;padding:10px}
        .qr{width:90px;height:90px;border-radius:6px;flex-shrink:0}
        .card-info{flex:1;display:flex;flex-direction:column;gap:4px}
        .student-name{font-size:13px;font-weight:900;color:#111827}
        .classe{font-size:10px;color:#6b7280;margin-bottom:4px}
        .row{display:flex;align-items:center;gap:6px}
        .label{font-size:9px;color:#9ca3af;font-weight:bold;text-transform:uppercase;width:72px}
        .code{font-size:11px;font-weight:900;color:#1a3285;background:#eef2ff;padding:2px 6px;border-radius:4px}
        .pass{font-size:11px;font-weight:700;color:#dc2626;background:#fef2f2;padding:2px 6px;border-radius:4px}
      </style></head><body>${pagesHTML}</body></html>`;
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  } catch (e: any) { Alert.alert('Erreur PDF', e.message); }
}

// ── STUDENT CARD (ViewShot) ────────────────────────
function StudentCard({ student, pc, schoolName, schoolLogo }: { student: any; pc: any; schoolName: string; schoolLogo?: string }) {
  const code = pc?.code || '';
  const password = pc?.password || '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}&format=png`;
  const avatar = getAvatar(student.full_name || '');
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Image source={require('../../assets/images/logo.png')} style={cardStyles.sbLogo} />
        <View style={cardStyles.headerCenter}>
          <Text style={cardStyles.headerTitle}>SchoolBox</Text>
          <Text style={cardStyles.headerSub}>Carte d'accès parent</Text>
        </View>
        {schoolLogo
          ? <Image source={{ uri: schoolLogo }} style={cardStyles.schoolLogo} />
          : <View style={cardStyles.schoolLogoPlaceholder}><Text style={{ fontSize: 20 }}>🏫</Text></View>}
      </View>
      <View style={cardStyles.schoolBar}>
        <Text style={cardStyles.schoolBarText}>{schoolName}</Text>
      </View>
      <View style={cardStyles.body}>
        <View style={cardStyles.qrBox}>
          <Image source={{ uri: qrUrl }} style={cardStyles.qrImg} />
        </View>
        <View style={cardStyles.info}>
          <View style={cardStyles.avatarRow}>
            <Text style={cardStyles.avatarEmoji}>{avatar}</Text>
            <Text style={cardStyles.studentName}>{student.full_name}</Text>
          </View>
          <View style={cardStyles.niveauBadge}>
            <Text style={cardStyles.niveauBadgeText}>
              {student.level?.name || ''}{student.class?.name ? ' · ' + student.class?.name : ''}
            </Text>
          </View>
          <Text style={cardStyles.fieldLabel}>CODE D'ACCÈS</Text>
          <View style={cardStyles.codeBox}><Text style={cardStyles.codeText}>{code}</Text></View>
          <Text style={[cardStyles.fieldLabel, { marginTop: 8 }]}>MOT DE PASSE</Text>
          <View style={cardStyles.passBox}><Text style={cardStyles.passText}>{password}</Text></View>
        </View>
      </View>
      <View style={cardStyles.footer}>
        <Text style={cardStyles.footerParent}>👤 {pc?.parent_name || ''}</Text>
        <Text style={cardStyles.footerHint}>Scannez ou entrez le code</Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { width: 370, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  header: { backgroundColor: NAV, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sbLogo: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(247, 247, 247, 0.1)' },
  headerCenter: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 1 },
  schoolLogo: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  schoolLogoPlaceholder: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  schoolBar: { backgroundColor: NAV2, paddingHorizontal: 16, paddingVertical: 6 },
  schoolBarText: { color: 'white', fontSize: 12, fontWeight: '700', textAlign: 'center', opacity: 0.9 },
  body: { padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: 'white' },
  qrBox: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 10, padding: 8 },
  qrImg: { width: 130, height: 130 },
  info: { flex: 1 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  avatarEmoji: { fontSize: 22 },
  studentName: { fontSize: 15, fontWeight: '900', color: '#111827', flexShrink: 1 },
  niveauBadge: { backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10, alignSelf: 'flex-start' },
  niveauBadgeText: { color: NAV2, fontSize: 11, fontWeight: '700' },
  fieldLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  codeBox: { backgroundColor: '#eef2ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  codeText: { fontSize: 14, fontWeight: '900', color: NAV2, letterSpacing: 1.5 },
  passBox: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  passText: { fontSize: 13, fontWeight: '700', color: '#dc2626', letterSpacing: 1.5 },
  footer: { backgroundColor: '#f9fafb', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  footerParent: { fontSize: 12, color: '#374151', fontWeight: '700' },
  footerHint: { fontSize: 10, color: '#9ca3af' },
});

// ── WHATSAPP ROW ───────────────────────────────────
function WhatsAppRow({ student, schoolName, schoolLogo }: { student: any; schoolName: string; schoolLogo?: string }) {
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendingImg, setSendingImg] = useState(false);
  const [sentMsg, setSentMsg] = useState(false);
  const [sentImg, setSentImg] = useState(false);
  const [pc, setPc] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const viewShotRef = useRef<any>(null);

  async function getPC() {
    if (pc) return pc;
    const { data } = await supabase.from('parent_codes').select('*').eq('student_id', student.id).single();
    setPc(data); return data;
  }

  async function sendMessage() {
    setSendingMsg(true);
    try {
      const pcData = await getPC();
      if (!pcData?.parent_phone) { Alert.alert('Erreur', 'Aucun numéro'); setSendingMsg(false); return; }
      const phone = formatPhone(pcData.parent_phone);
      const message = `🎒 *SchoolBox - Accès Parent*\n\nBonjour *${pcData.parent_name || student.full_name}*,\n\nVoici les informations d'accès de votre enfant *${student.full_name}*:\n\n📚 Niveau: *${student.level?.name || ''}*${student.class?.name ? '\n🏫 Classe: *' + student.class?.name + '*' : ''}\n\n📱 Code: *${pcData.code}*\n🔑 Mot de passe: *${pcData.password || ''}*\n\nTéléchargez *SchoolBox* et connectez-vous avec ce code.\n\n_Bonne scolarité! 🌟_`;
      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) { await Linking.openURL(url); setSentMsg(true); }
      else Alert.alert('Erreur', 'WhatsApp non disponible');
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setSendingMsg(false);
  }

  async function sendImage() {
    setSendingImg(true);
    try {
      const pcData = await getPC();
      if (!pcData?.parent_phone) { Alert.alert('Erreur', 'Aucun numéro'); setSendingImg(false); return; }
      const phone = formatPhone(pcData.parent_phone);
      setShowCard(true);
      await new Promise(r => setTimeout(r, 1200));
      const uri = await viewShotRef.current.capture();
      const destUri = FileSystem.documentDirectory + `card_${student.id}.png`;
      await FileSystem.copyAsync({ from: uri, to: destUri });
      setShowCard(false);
      const waUrl = `whatsapp://send?phone=${phone}`;
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) await Linking.openURL(waUrl);
      await new Promise(r => setTimeout(r, 1500));
      await Sharing.shareAsync(destUri, { mimeType: 'image/png', dialogTitle: `Carte de ${student.full_name}` });
      setSentImg(true);
    } catch (e: any) { setShowCard(false); Alert.alert('Erreur', e.message); }
    setSendingImg(false);
  }

  return (
    <View>
      {showCard && (
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}
          style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <StudentCard student={student} pc={pc} schoolName={schoolName} schoolLogo={schoolLogo} />
        </ViewShot>
      )}
      <View style={waStyles.row}>
        <View style={waStyles.avatar}>
          <Text style={waStyles.avatarText}>{getAvatar(student.full_name)}</Text>
        </View>
        <View style={waStyles.info}>
          <Text style={waStyles.name}>{student.full_name}</Text>
          <Text style={waStyles.level}>{student.level?.name}{student.class?.name ? ` · ${student.class?.name}` : ''}</Text>
        </View>
        <TouchableOpacity style={[waStyles.msgBtn, sentMsg && waStyles.btnSent]} onPress={sendMessage} disabled={sendingMsg}>
          {sendingMsg ? <ActivityIndicator color="white" size="small" /> : (sentMsg ? <Text style={{ fontSize: 16 }}>✅</Text> : <IconMsg size={16} color="white" />)}
        </TouchableOpacity>
        <TouchableOpacity style={[waStyles.imgBtn, sentImg && waStyles.imgBtnSent]} onPress={sendImage} disabled={sendingImg}>
          {sendingImg ? <ActivityIndicator color={NAV} size="small" /> : (sentImg ? <Text style={{ fontSize: 16 }}>✅</Text> : <IconImage size={16} color={NAV} />)}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const waStyles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 14, padding: 12, alignItems: 'center', marginBottom: 8, shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '800', color: NAV, marginBottom: 2 },
  level: { fontSize: 11, color: '#718096', fontWeight: '600' },
  msgBtn: { backgroundColor: '#25D366', borderRadius: 10, width: 38, height: 38, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  imgBtn: { backgroundColor: '#eef2ff', borderRadius: 10, width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  imgBtnSent: { backgroundColor: '#dcfce7' },
  btnSent: { backgroundColor: '#16a34a' },
  niveauHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: NAV, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8, marginTop: 4 },
  niveauTitle: { fontSize: 15, fontWeight: '900', color: 'white' },
  niveauCount: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  brancheHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef2ff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 6, marginTop: 2 },
  brancheTitle: { fontSize: 13, fontWeight: '700', color: NAV2 },
  brancheCount: { fontSize: 12, color: NAV2, fontWeight: '700' },
});

// ── MAIN ──────────────────────────────────────────
export default function SchoolDetail() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [screen, setScreen] = useState<'types' | 'niveaux' | 'branches' | 'students'>('types');
  const [activeType, setActiveType] = useState('');
  const [activeNiveau, setActiveNiveau] = useState('');
  const [activeBranche, setActiveBranche] = useState('');
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const availableTypes: string[] = schoolData?.type
    ? schoolData.type.split(', ').map((t: string) => TYPE_KEY_MAP[t.trim()] || t.trim()).filter((t: string) => SCHOOL_TYPES[t])
    : Object.keys(SCHOOL_TYPES);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setRefreshing(true);
    const [studentsRes, schoolRes] = await Promise.all([
      supabase.from('students').select('id, full_name, level:levels(name), class:classes(name)').eq('school_id', id).order('full_name'),
      supabase.from('schools').select('*').eq('id', id).single(),
    ]);
    setAllStudents(studentsRes.data || []);
    setSchoolData(schoolRes.data);
    setRefreshing(false);
  }

  async function deleteAll(list: any[], label: string, afterDelete: () => void) {
    Alert.alert('🗑️ Supprimer tous', `Supprimer les ${list.length} élèves de ${label} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        for (const s of list) {
          await supabase.from('parent_codes').delete().eq('student_id', s.id);
          await supabase.from('students').delete().eq('id', s.id);
        }
        await loadData(); afterDelete();
      }}
    ]);
  }

  async function exportListExcel(list: any[], fileName: string) {
    try {
      const rows = list.map(s => ({ nom_eleve: s.full_name, niveau: s.level?.name || '', classe: s.class?.name || '' }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Élèves');
      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileUri = FileSystem.documentDirectory + `${fileName}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri);
    } catch (e: any) { Alert.alert('Erreur', e.message); }
  }

  async function exportPDFCodes(list: any[], label: string) {
    setExportingPDF(true);
    try {
      const enriched = await Promise.all(list.map(async (s) => {
        const { data: pc } = await supabase.from('parent_codes').select('code, password').eq('student_id', s.id).single();
        return { full_name: s.full_name, niveau: s.level?.name || label, classe: s.class?.name || '', code: pc?.code || '', password: pc?.password || '' };
      }));
      await generatePDF(enriched, String(name));
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setExportingPDF(false);
  }

  function goBack() {
    if (showSearch) { setShowSearch(false); setSearchQuery(''); return; }
    if (showStats) { setShowStats(false); return; }
    if (showWhatsApp) { setShowWhatsApp(false); return; }
    if (screen === 'students') {
      if (NIVEAU_BRANCHES[activeNiveau]) { setScreen('branches'); setActiveBranche(''); }
      else setScreen('niveaux');
    } else if (screen === 'branches') {
      setScreen('niveaux');
    } else if (screen === 'niveaux') {
      setScreen('types'); setActiveType('');
    } else {
      router.back();
    }
  }

  function selectType(type: string) { setActiveType(type); setActiveNiveau(''); setActiveBranche(''); setScreen('niveaux'); }
  function selectNiveau(niveau: string) {
    setActiveNiveau(niveau); setActiveBranche('');
    if (NIVEAU_BRANCHES[niveau]) { setScreen('branches'); }
    else { setStudents(allStudents.filter((s: any) => s.level?.name === niveau)); setScreen('students'); }
  }
  function selectBranche(branche: string) {
    setActiveBranche(branche);
    setStudents(allStudents.filter((s: any) => s.level?.name === activeNiveau && s.class?.name === branche));
    setScreen('students');
  }

  async function importExcel() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (result.canceled || !result.assets[0]) return;
    setImporting(true);
    try {
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
      const buffer = Uint8Array.from(atob(content), c => c.charCodeAt(0)).buffer;
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];
      let success = 0; let failed = 0;
      const importedStudents: any[] = [];
      for (const row of rows) {
        try {
          const studentName = row.nom_eleve || '';
          const typeEcole = row.type_ecole || 'Primaire';
          const niveauName = row.niveau || '';
          const classeName = row.classe || '';
          const parentName = row.nom_parent || '';
          const parentPhone = row.telephone || '';
          if (!studentName || !niveauName) { failed++; continue; }
          let { data: level } = await supabase.from('levels').select('id').eq('name', niveauName).eq('school_id', id).single();
          if (!level) {
            const { data: nl } = await supabase.from('levels').insert({ name: niveauName, school_id: id, type: typeEcole }).select().single();
            level = nl;
          }
          let { data: cls } = await supabase.from('classes').select('id').eq('name', classeName).eq('school_id', id).single();
          if (!cls && classeName) {
            const { data: nc } = await supabase.from('classes').insert({ name: classeName, level_id: level?.id, school_id: id }).select().single();
            cls = nc;
          }
          const { data: student } = await supabase.from('students').insert({ full_name: studentName, school_id: id, level_id: level?.id, class_id: cls?.id }).select().single();
          if (student) {
            const code = generateCode();
            const password = generatePassword();
            await supabase.from('parent_codes').insert({ code, password, parent_name: parentName || studentName, parent_phone: parentPhone, student_id: student.id });
            importedStudents.push({ full_name: studentName, niveau: niveauName, classe: classeName, code, password });
          }
          success++;
        } catch (e) { failed++; }
      }
      await loadData();
      Alert.alert('Import terminé ✅', `${success} élèves importés\n❌ ${failed} échecs`, [
        { text: 'Fermer', style: 'cancel' },
        { text: '📄 PDF', onPress: async () => { await generatePDF(importedStudents, String(name)); } },
        { text: '💬 WhatsApp', onPress: () => { setShowWhatsApp(true); } },
      ]);
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setImporting(false);
  }

  const countByType = (t: string) => allStudents.filter((s: any) => SCHOOL_TYPES[t]?.niveaux.includes(s.level?.name)).length;
  const countByNiveau = (n: string) => allStudents.filter((s: any) => s.level?.name === n).length;
  const countByBranche = (b: string) => allStudents.filter((s: any) => s.level?.name === activeNiveau && s.class?.name === b).length;
  const searchResults = searchQuery.length > 1 ? allStudents.filter((s: any) => s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  // ── WhatsApp List
  const WhatsAppList = () => {
    const groups: Record<string, Record<string, any[]>> = {};
    for (const s of allStudents) {
      const niveau = s.level?.name || 'Autre';
      const branche = s.class?.name || '';
      if (!groups[niveau]) groups[niveau] = {};
      if (!groups[niveau][branche]) groups[niveau][branche] = [];
      groups[niveau][branche].push(s);
    }
    return (
      <View style={{ gap: 4 }}>
        <Text style={styles.listCount}>💬 {allStudents.length} parents</Text>
        {Object.entries(groups).map(([niveau, branches]) => (
          <View key={niveau} style={{ marginBottom: 12 }}>
            <View style={waStyles.niveauHeader}>
              <Text style={waStyles.niveauTitle}>📚 {niveau}</Text>
              <Text style={waStyles.niveauCount}>{Object.values(branches).flat().length} élèves</Text>
            </View>
            {Object.entries(branches).map(([branche, studs]) => (
              <View key={branche || 'no-branche'}>
                {branche ? (
                  <View style={waStyles.brancheHeader}>
                    <Text style={waStyles.brancheTitle}>{branche}</Text>
                    <Text style={waStyles.brancheCount}>{studs.length}</Text>
                  </View>
                ) : null}
                {studs.map(s => (
                  <WhatsAppRow key={s.id} student={s} schoolName={String(name)} schoolLogo={schoolData?.logo_url} />
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // ── TYPE CARD COLOR
  const typeColors: Record<string, string> = {
    Maternelle: '#7c3aed', Primaire: NAV2, College: '#0369a1', Lycee: '#0f2356',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <View style={styles.decCircle} />

        {/* Row 1 — Logo + Nom école + SB Logo */}
        <View style={styles.topRow1}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <IconBack size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.schoolInfo}>
            {schoolData?.logo_url
              ? <Image source={{ uri: schoolData.logo_url }} style={styles.schoolLogo} />
              : <View style={styles.schoolLogoPlaceholder}><Text style={{ fontSize: 16 }}>🏫</Text></View>
            }
            <Text style={styles.schoolName} numberOfLines={1}>{name}</Text>
          </View>
          <Image source={require('../../assets/images/logo.png')} style={styles.sbLogo} />
        </View>

        {/* Row 2 — Breadcrumb + Action Buttons */}
        <View style={styles.topRow2}>
          {screen !== 'types' && !showSearch && !showStats && !showWhatsApp && (
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText} numberOfLines={1}>
                {SCHOOL_TYPES[activeType]?.label}{activeNiveau ? ` › ${activeNiveau}` : ''}{activeBranche ? ` › ${activeBranche}` : ''}
              </Text>
            </View>
          )}
          {(screen === 'types' || showSearch || showStats || showWhatsApp) && <View style={{ flex: 1 }} />}
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={[styles.actionBtn, showSearch && styles.actionBtnActive]}
              onPress={() => { setShowSearch(!showSearch); setShowStats(false); setShowWhatsApp(false); setSearchQuery(''); }}>
              <IconSearch size={16} color={showSearch ? NAV : 'rgba(255,255,255,0.85)'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, showStats && styles.actionBtnActive]}
              onPress={() => { setShowStats(!showStats); setShowSearch(false); setShowWhatsApp(false); }}>
              <IconStats size={16} color={showStats ? NAV : 'rgba(255,255,255,0.85)'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, showWhatsApp && { backgroundColor: '#dcfce7' }]}
              onPress={() => { setShowWhatsApp(!showWhatsApp); setShowSearch(false); setShowStats(false); }}>
              <IconWhatsApp size={16} color={showWhatsApp ? '#16a34a' : '#25D366'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: 'rgba(229,62,62,0.15)', borderColor: 'rgba(229,62,62,0.3)' }]}
              onPress={() => exportPDFCodes(allStudents, String(name))} disabled={exportingPDF}>
              {exportingPDF ? <ActivityIndicator color={RED} size="small" /> : <IconPDF size={16} color={RED} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.importBtn} onPress={importExcel} disabled={importing}>
              {importing ? <ActivityIndicator color="white" size="small" /> : <IconImport size={16} color="white" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={styles.searchBar}>
            <IconSearch size={16} color="#9ca3af" />
            <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery}
              placeholder="Rechercher un élève..." placeholderTextColor="#9ca3af" autoFocus />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ fontSize: 16, color: '#9ca3af' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── SCROLL ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={NAV} />}
        showsVerticalScrollIndicator={false}
      >
        {/* WHATSAPP */}
        {showWhatsApp && <WhatsAppList />}

        {/* SEARCH */}
        {showSearch && !showWhatsApp && (
          <View style={{ gap: 8 }}>
            {searchQuery.length < 2
              ? <Text style={styles.hint}>Tapez au moins 2 lettres...</Text>
              : searchResults.length === 0
                ? <Text style={styles.hint}>Aucun résultat pour "{searchQuery}"</Text>
                : <>
                    <Text style={styles.listCount}>{searchResults.length} résultat(s)</Text>
                    {searchResults.map(student => (
                      <TouchableOpacity key={student.id} style={styles.studentCard}
                        onPress={() => router.push({ pathname: '/admin/student-detail' as any, params: { id: student.id } })}>
                        <View style={styles.studentAvatar}><Text style={{ fontSize: 22 }}>{getAvatar(student.full_name)}</Text></View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.studentName}>{student.full_name}</Text>
                          <Text style={styles.studentLevel}>{student.level?.name}{student.class?.name ? ` · ${student.class?.name}` : ''}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </>
            }
          </View>
        )}

        {/* STATS */}
        {showStats && !showSearch && !showWhatsApp && (
          <View style={{ gap: 12 }}>
            <View style={styles.statsTotalCard}>
              <Text style={styles.statsTotalNum}>{allStudents.length}</Text>
              <Text style={styles.statsTotalLabel}>Total élèves</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={styles.exportPill} onPress={() => exportListExcel(allStudents, `eleves_${name}`)}>
                  <IconExcel size={14} color="white" /><Text style={styles.exportPillText}>Excel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportPill, { backgroundColor: RED }]}
                  onPress={() => exportPDFCodes(allStudents, String(name))} disabled={exportingPDF}>
                  {exportingPDF ? <ActivityIndicator color="white" size="small" /> : <><IconPDF size={14} color="white" /><Text style={styles.exportPillText}>PDF</Text></>}
                </TouchableOpacity>
              </View>
            </View>
            {availableTypes.map(type => {
              const typeStudents = allStudents.filter((s: any) => SCHOOL_TYPES[type]?.niveaux.includes(s.level?.name));
              if (typeStudents.length === 0) return null;
              return (
                <View key={type} style={styles.statsCard}>
                  <View style={styles.statsCardHeader}>
                    <View style={[styles.statsTypeDot, { backgroundColor: typeColors[type] || NAV }]} />
                    <Text style={styles.statsCardTitle}>{SCHOOL_TYPES[type]?.label}</Text>
                    <Text style={styles.statsCardCount}>{typeStudents.length}</Text>
                    <TouchableOpacity onPress={() => exportListExcel(typeStudents, `eleves_${type}`)}>
                      <IconExcel size={16} color={NAV2} />
                    </TouchableOpacity>
                  </View>
                  {SCHOOL_TYPES[type]?.niveaux.map(n => {
                    const count = countByNiveau(n);
                    if (count === 0) return null;
                    return (
                      <View key={n} style={styles.statsRow}>
                        <Text style={styles.statsNiveau}>{n}</Text>
                        <View style={styles.statsBarBg}>
                          <View style={[styles.statsBarFill, { width: `${Math.min((count / allStudents.length) * 100 * 3, 100)}%` as any, backgroundColor: typeColors[type] || NAV }]} />
                        </View>
                        <Text style={styles.statsNum}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {/* MAIN NAV */}
        {!showSearch && !showStats && !showWhatsApp && (
          <>
            {/* TYPES */}
            {screen === 'types' && (
              <View style={{ gap: 10 }}>
                {allStudents.length > 0 && (
                  <TouchableOpacity style={styles.deleteAllBtn} onPress={() => deleteAll(allStudents, 'cette école', () => {})}>
                    <IconTrash size={16} color="white" />
                    <Text style={styles.deleteAllText}>Supprimer tous ({allStudents.length})</Text>
                  </TouchableOpacity>
                )}
                {availableTypes.map((type: string) => (
                  <TouchableOpacity key={type} style={[styles.typeCard, { borderLeftColor: typeColors[type] || NAV }]}
                    onPress={() => selectType(type)}>
                    <View style={[styles.typeIconWrap, { backgroundColor: typeColors[type] || NAV }]}>
                      <Text style={{ fontSize: 22 }}>🏫</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeTitle}>{SCHOOL_TYPES[type]?.label || type}</Text>
                      <Text style={styles.typeCount}>{countByType(type)} élèves</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* NIVEAUX */}
            {screen === 'niveaux' && (
              <View style={{ gap: 10 }}>
                {(() => {
                  const list = allStudents.filter((s: any) => SCHOOL_TYPES[activeType]?.niveaux.includes(s.level?.name));
                  return list.length > 0 ? (
                    <TouchableOpacity style={styles.deleteAllBtn} onPress={() => deleteAll(list, SCHOOL_TYPES[activeType]?.label || activeType, () => setScreen('types'))}>
                      <IconTrash size={16} color="white" />
                      <Text style={styles.deleteAllText}>Supprimer tous ({list.length})</Text>
                    </TouchableOpacity>
                  ) : null;
                })()}
                {SCHOOL_TYPES[activeType]?.niveaux.map(niveau => (
                  <TouchableOpacity key={niveau} style={styles.niveauCard} onPress={() => selectNiveau(niveau)}>
                    <View style={styles.niveauBadge}>
                      <Text style={styles.niveauBadgeText}>{niveau}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.niveauCount}>{countByNiveau(niveau)} élèves</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* BRANCHES */}
            {screen === 'branches' && (
              <View style={{ gap: 10 }}>
                {(() => {
                  const list = allStudents.filter((s: any) => s.level?.name === activeNiveau);
                  return list.length > 0 ? (
                    <TouchableOpacity style={styles.deleteAllBtn} onPress={() => deleteAll(list, activeNiveau, () => setScreen('niveaux'))}>
                      <IconTrash size={16} color="white" />
                      <Text style={styles.deleteAllText}>Supprimer tous ({list.length})</Text>
                    </TouchableOpacity>
                  ) : null;
                })()}
                {NIVEAU_BRANCHES[activeNiveau]?.map(branche => (
                  <TouchableOpacity key={branche} style={styles.brancheCard} onPress={() => selectBranche(branche)}>
                    <View style={styles.brancheIconWrap}>
                      <Text style={{ fontSize: 18 }}>📘</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.brancheTitle}>{branche}</Text>
                      <Text style={styles.brancheCount}>{countByBranche(branche)} élèves</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* STUDENTS */}
            {screen === 'students' && (
              <View style={{ gap: 8 }}>
                <View style={styles.studentsHeader}>
                  <Text style={styles.listCount}>{students.length} élèves</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity style={styles.smallBtn}
                      onPress={() => exportListExcel(students, `eleves_${activeNiveau}_${activeBranche || ''}`)}>
                      <IconExcel size={14} color={NAV2} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#fef2f2' }]}
                      onPress={() => exportPDFCodes(students, activeBranche || activeNiveau)} disabled={exportingPDF}>
                      {exportingPDF ? <ActivityIndicator color={RED} size="small" /> : <IconPDF size={14} color={RED} />}
                    </TouchableOpacity>
                    {students.length > 0 && (
                      <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#fef2f2' }]}
                        onPress={() => deleteAll(students, activeBranche || activeNiveau, () => setScreen(NIVEAU_BRANCHES[activeNiveau] ? 'branches' : 'niveaux'))}>
                        <IconTrash size={14} color={RED} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {students.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={{ fontSize: 52 }}>🎒</Text>
                    <Text style={styles.emptyTitle}>Aucun élève</Text>
                    <TouchableOpacity style={styles.importBtnLarge} onPress={importExcel}>
                      <IconImport size={18} color="white" />
                      <Text style={styles.importBtnLargeText}>Importer Excel</Text>
                    </TouchableOpacity>
                  </View>
                ) : students.map(student => (
                  <TouchableOpacity key={student.id} style={styles.studentCard}
                    onPress={() => router.push({ pathname: '/admin/student-detail' as any, params: { id: student.id } })}>
                    <View style={styles.studentAvatar}><Text style={{ fontSize: 22 }}>{getAvatar(student.full_name)}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.full_name}</Text>
                      <Text style={styles.studentLevel}>{student.level?.name}{student.class?.name ? ` · ${student.class?.name}` : ''}</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },

  // TOP BAR
  topBar: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, gap: 10, overflow: 'hidden' },
  decCircle: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 80 },
  topRow1: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  schoolInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  schoolLogo: { width: 30, height: 30, borderRadius: 8 },
  schoolLogoPlaceholder: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  schoolName: { fontSize: 15, fontWeight: '800', color: 'white', flex: 1, textAlign: 'center' },
  sbLogo: { width: 38, height: 38, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  topRow2: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breadcrumb: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  breadcrumbText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  actionBtns: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  actionBtnActive: { backgroundColor: 'white' },
  importBtn: { width: 34, height: 34, backgroundColor: RED, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  searchInput: { flex: 1, fontSize: 14, color: 'white' },

  // SCROLL
  scroll: { padding: 16, paddingTop: 16 },
  hint: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 30, fontWeight: '600' },
  listCount: { fontSize: 13, color: '#374151', fontWeight: '700', marginBottom: 4 },
  arrow: { fontSize: 22, color: '#d1d5db', fontWeight: '700' },

  // TYPE CARDS
  typeCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, borderLeftWidth: 4 },
  typeIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  typeTitle: { fontSize: 16, fontWeight: '900', color: NAV, marginBottom: 2 },
  typeCount: { fontSize: 12, color: '#718096', fontWeight: '600' },

  // NIVEAU CARDS
  niveauCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.07)' },
  niveauBadge: { backgroundColor: NAV, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, minWidth: 60, alignItems: 'center' },
  niveauBadgeText: { fontSize: 16, fontWeight: '900', color: 'white' },
  niveauCount: { fontSize: 13, color: '#718096', fontWeight: '600' },

  // BRANCHE CARDS
  brancheCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.07)' },
  brancheIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  brancheTitle: { fontSize: 15, fontWeight: '800', color: NAV, marginBottom: 2 },
  brancheCount: { fontSize: 12, color: '#718096', fontWeight: '600' },

  // STUDENT CARDS
  studentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  studentCard: { backgroundColor: 'white', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  studentAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  studentName: { fontSize: 14, fontWeight: '800', color: NAV, marginBottom: 2 },
  studentLevel: { fontSize: 11, color: '#718096', fontWeight: '600' },

  // DELETE BTN
  deleteAllBtn: { backgroundColor: RED, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  deleteAllText: { color: 'white', fontSize: 14, fontWeight: '800' },

  // SMALL BTNS
  smallBtn: { width: 34, height: 34, backgroundColor: '#eef2ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // STATS
  statsTotalCard: { backgroundColor: NAV, borderRadius: 20, padding: 24, alignItems: 'center', gap: 4 },
  statsTotalNum: { fontSize: 56, fontWeight: '900', color: 'white' },
  statsTotalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  exportPill: { backgroundColor: NAV2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  exportPillText: { color: 'white', fontWeight: '700', fontSize: 13 },
  statsCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  statsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  statsTypeDot: { width: 10, height: 10, borderRadius: 5 },
  statsCardTitle: { fontSize: 15, fontWeight: '800', color: NAV, flex: 1 },
  statsCardCount: { fontSize: 14, color: NAV2, fontWeight: '800', marginRight: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  statsNiveau: { fontSize: 12, fontWeight: '800', color: NAV, width: 44 },
  statsBarBg: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  statsBarFill: { height: 8, borderRadius: 4 },
  statsNum: { fontSize: 12, fontWeight: '800', color: NAV, width: 26, textAlign: 'right' },

  // EMPTY
  emptyState: { alignItems: 'center', paddingVertical: 50, gap: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334768' },
  importBtnLarge: { backgroundColor: NAV, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  importBtnLargeText: { color: 'white', fontWeight: '800', fontSize: 15 },
});
