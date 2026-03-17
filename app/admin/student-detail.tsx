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
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const NAV2 = '#1a3285';
const RED = '#e53e3e';

const NIVEAU_BRANCHES: Record<string, string[]> = {
  'TC': ['Sciences', 'Lettres et Sciences Humaines'],
  '1BAC': ['Sciences X', 'Sciences Math', 'Sciences Économiques', 'Lettres et Sciences Humaines'],
  '2BAC': ['Math', 'Physique', 'SVT', 'Économie', 'Gestion', 'Lettres et Sciences Humaines'],
};
const ALL_NIVEAUX = ['PS','MS','GS','CP','CE1','CE2','CM1','CM2','CE6','1AC','2AC','3AC','TC','1BAC','2BAC'];

// ── ICONS ──────────────────────────────────────────
function IconBack({ size = 20, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconEdit({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconQR({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M14 14h3v3M17 17h3v3M14 20h3" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconPDF({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M9 13h6M9 17h4" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconMsg({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconImage({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={2} /><Circle cx="8.5" cy="8.5" r="1.5" stroke={color} strokeWidth={2} /><Polyline points="21 15 16 10 5 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconTrash({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconSave({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconShare({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="16 6 12 2 8 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="12" y1="2" x2="12" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}
function IconWhatsApp({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconSchool({ size = 16, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconBook({ size = 16, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconUser({ size = 16, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconCalendar({ size = 16, color = '#718096' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>;
}

// ── HELPERS ────────────────────────────────────────
function getAvatar(name: string): string {
  const n = name?.trim().toLowerCase() || '';
  const maleNames = [
    'mohamed','ahmed','mahmoud','mustapha','youssef','yassine','ilyas','ismail','ayoub',
    'yaacoub','ibrahim','adam','idriss','zakaria','nouh','haroun','souleimane','daoud',
    'hamza','anas','amine','bilal','sofiane','mouad','taha','houssam','hicham','aymane',
    'younes','marouane','adnane','rayane','zine','louay','khalid','tarik','adel','karim',
    'jalal','jamal','samir','said','rachid','fouad','mounir','mounsef','aziz','najib',
    'badr','amjad','mehdi','chadi','rabie','talal','faris','salim','rami','nader','sami',
    'ziad','kamal','mourad','achraf','walid','imad','anouar','anis','chouaib','haitham',
    'hamid','abdelilah','abdelaziz','abdelkrim','abderrahmane','abdeslam','abderrahim',
    'abdellatif','abdelhak','abdelkader','abdessamad','abdellah','yacine','nabil',
    'othmane','oussama','naim','nassim','reda','ridouane','iskander','jalil','lahcen',
    'lamine','hatem','hadi','jawad','jaber','jalaleddine','jamaleddine','saad','saadi',
    'salah','salmane','simo','sidi','soufiane','souhail','soufyan','taoufik','tayeb',
    'toufik','touhami','tarek','tewfik','youness','younis','yacoub','zakariya','zaki',
    'ziyad','zineabidine','zoubir','zouhair','zaid','zayd','zahir','ayad','iyad','iyane',
    'idir','massin','massinissa','yugurta','aksel','anir','amghar','ayyoub','ayham',
    'fares','fadi','fadel','fahd','fathi','faysal','faycal','ghali','ghassan','ghaith',
    'housni','hamidou','hamdane','hamidane','imrane','imran','iskandar','joud','jamil',
    'joudi','karam','kamil','kinan','louai','lyes','lounis','maher','malek','mansour',
    'marwan','mazen','mido','mouhcine','moulay','moumen','moutaz','nadim','nasser',
    'nizar','noureddine','omar','oualid','rachad','rayan','rida','sabir','saif','samy','moha',
    'siraj','yasser',
  ];
  return maleNames.some(fn => n.startsWith(fn)) ? '👦' : '👧';
}


// ── STUDENT CARD (ViewShot) ────────────────────────
function StudentCard({ student, parentCode }: { student: any; parentCode: any }) {
  const code = parentCode?.code || '';
  const password = parentCode?.password || '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}&format=png`;
  const avatar = getAvatar(student?.full_name || '');
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Image source={require('../../assets/images/logo.jpg')} style={cardStyles.sbLogo} />
        <View style={cardStyles.headerCenter}>
          <Text style={cardStyles.headerTitle}>SchoolBox</Text>
          <Text style={cardStyles.headerSub}>Carte d'accès parent</Text>
        </View>
        {student?.school?.logo_url
          ? <Image source={{ uri: student.school.logo_url }} style={cardStyles.schoolLogo} />
          : <View style={cardStyles.schoolLogoPlaceholder}><Text style={{ fontSize: 20 }}>🏫</Text></View>}
      </View>
      <View style={cardStyles.schoolBar}>
        <Text style={cardStyles.schoolBarText}>{student?.school?.name || ''}</Text>
      </View>
      <View style={cardStyles.body}>
        <View style={cardStyles.qrBox}>
          <Image source={{ uri: qrUrl }} style={cardStyles.qrImg} />
        </View>
        <View style={cardStyles.info}>
          <View style={cardStyles.avatarRow}>
            <Text style={cardStyles.avatarEmoji}>{avatar}</Text>
            <Text style={cardStyles.studentName}>{student?.full_name}</Text>
          </View>
          <View style={cardStyles.niveauBadge}>
            <Text style={cardStyles.niveauBadgeText}>
              {student?.level?.name || ''}{student?.class?.name ? ' · ' + student?.class?.name : ''}
            </Text>
          </View>
          <Text style={cardStyles.fieldLabel}>CODE D'ACCÈS</Text>
          <View style={cardStyles.codeBox}><Text style={cardStyles.codeText}>{code}</Text></View>
          <Text style={[cardStyles.fieldLabel, { marginTop: 8 }]}>MOT DE PASSE</Text>
          <View style={cardStyles.passBox}><Text style={cardStyles.passText}>{password}</Text></View>
        </View>
      </View>
      <View style={cardStyles.footer}>
        <Text style={cardStyles.footerParent}>👤 {parentCode?.parent_name || ''}</Text>
        <Text style={cardStyles.footerHint}>Scannez ou entrez le code</Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { width: 370, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  header: { backgroundColor: NAV, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sbLogo: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
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

// ── MAIN ──────────────────────────────────────────
export default function StudentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qrRef = useRef<any>(null);
  const viewShotRef = useRef<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [parentCode, setParentCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sharingImg, setSharingImg] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [editName, setEditName] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editNiveau, setEditNiveau] = useState('');
  const [editBranche, setEditBranche] = useState('');

  useEffect(() => { loadStudent(); }, []);

  async function loadStudent() {
    setLoading(true);
    const { data: s } = await supabase
      .from('students')
      .select('id, full_name, school_id, school:schools(name, logo_url), level:levels(id, name), class:classes(id, name), created_at')
      .eq('id', id).single();
    setStudent(s);
    if (s) {
      const { data: pc } = await supabase.from('parent_codes').select('*').eq('student_id', s.id).single();
      setParentCode(pc);
    }
    setLoading(false);
  }

  function openEdit() {
    setEditName(student?.full_name || '');
    setEditParentName(parentCode?.parent_name || '');
    setEditParentPhone(parentCode?.parent_phone || '');
    setEditNiveau(student?.level?.name || '');
    setEditBranche(student?.class?.name || '');
    setShowEdit(true);
  }

  async function saveEdit() {
    if (!editName) { Alert.alert('Erreur', 'Entrez le nom'); return; }
    setSaving(true);
    try {
      const schoolId = student?.school_id;
      await supabase.from('students').update({ full_name: editName }).eq('id', id);
      if (editNiveau) {
        let { data: level } = await supabase.from('levels').select('id').eq('name', editNiveau).eq('school_id', schoolId).single();
        if (!level) {
          const { data: nl } = await supabase.from('levels').insert({ name: editNiveau, school_id: schoolId }).select().single();
          level = nl;
        }
        await supabase.from('students').update({ level_id: level?.id }).eq('id', id);
      }
      if (editBranche) {
        let { data: cls } = await supabase.from('classes').select('id').eq('name', editBranche).eq('school_id', schoolId).single();
        if (!cls) {
          const { data: nc } = await supabase.from('classes').insert({ name: editBranche, school_id: schoolId }).select().single();
          cls = nc;
        }
        await supabase.from('students').update({ class_id: cls?.id }).eq('id', id);
      }
      if (parentCode) {
        await supabase.from('parent_codes').update({ parent_name: editParentName, parent_phone: editParentPhone }).eq('id', parentCode.id);
      }
      setShowEdit(false);
      loadStudent();
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setSaving(false);
  }

  async function deleteStudent() {
    Alert.alert('Supprimer', `Supprimer ${student?.full_name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        setDeleting(true);
        await supabase.from('parent_codes').delete().eq('student_id', id);
        await supabase.from('students').delete().eq('id', id);
        router.back();
      }}
    ]);
  }

  async function exportQR() {
    try {
      if (qrRef.current) {
        qrRef.current.toDataURL(async (data: string) => {
          const fileUri = FileSystem.documentDirectory + `qr_${parentCode?.code}.png`;
          await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.Base64 });
          await Sharing.shareAsync(fileUri);
        });
      }
    } catch (e: any) { Alert.alert('Erreur', e.message); }
  }

  async function shareCard() {
    setSharing(true);
    try {
      const code = parentCode?.code || '';
      const password = parentCode?.password || '';
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}&format=png`;
      const schoolLogoHtml = student?.school?.logo_url
        ? `<img src="${student.school.logo_url}" class="school-logo" />`
        : `<div class="school-logo-placeholder">🏫</div>`;
      const avatar = getAvatar(student?.full_name || '');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Arial,sans-serif;background:#f3f4f6;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px}
          .card{width:420px;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
          .header{background:${NAV};padding:16px 20px;display:flex;align-items:center;gap:12px}
          .sb-logo{width:48px;height:48px;border-radius:12px;border:2px solid rgba(255,255,255,0.4)}
          .header-center{flex:1}
          .header-title{color:white;font-size:22px;font-weight:900}
          .header-sub{color:rgba(255,255,255,0.75);font-size:13px;margin-top:2px}
          .school-logo{width:48px;height:48px;border-radius:12px;border:2px solid rgba(255,255,255,0.4)}
          .school-logo-placeholder{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:24px}
          .school-bar{background:${NAV2};padding:6px 20px;text-align:center}
          .school-bar-text{color:white;font-size:13px;font-weight:700;opacity:0.9}
          .body{background:white;padding:20px;display:flex;flex-direction:row;gap:16px;align-items:center}
          .qr-box{border:2px solid #e5e7eb;border-radius:12px;padding:10px;flex-shrink:0;background:white}
          .qr{width:140px;height:140px;display:block}
          .info{flex:1}
          .avatar-row{display:flex;align-items:center;gap:6px;margin-bottom:6px}
          .avatar-emoji{font-size:22px}
          .student-name{font-size:17px;font-weight:900;color:#111827}
          .niveau-badge{display:inline-block;background:#eef2ff;color:${NAV2};font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:12px}
          .field{margin-bottom:10px}
          .field-label{font-size:10px;color:#9ca3af;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
          .field-code{font-size:16px;font-weight:900;color:${NAV2};background:#eef2ff;padding:6px 12px;border-radius:8px;display:inline-block;letter-spacing:1.5px}
          .field-pass{font-size:15px;font-weight:700;color:#dc2626;background:#fef2f2;padding:6px 12px;border-radius:8px;display:inline-block;letter-spacing:1.5px}
          .footer{background:#f9fafb;padding:12px 20px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center}
          .footer-parent{font-size:12px;color:#374151;font-weight:700}
          .footer-hint{font-size:11px;color:#9ca3af}
        </style></head>
        <body><div class="card">
          <div class="header">
            <div class="header-center"><div class="header-title">SchoolBox</div><div class="header-sub">Carte d'accès parent</div></div>
            ${schoolLogoHtml}
          </div>
          <div class="school-bar"><div class="school-bar-text">${student?.school?.name || ''}</div></div>
          <div class="body">
            <div class="qr-box"><img src="${qrUrl}" class="qr" /></div>
            <div class="info">
              <div class="avatar-row"><span class="avatar-emoji">${avatar}</span><span class="student-name">${student?.full_name || ''}</span></div>
              <div class="niveau-badge">${student?.level?.name || ''}${student?.class?.name ? ' · ' + student?.class?.name : ''}</div>
              <div class="field"><div class="field-label">Code d'accès</div><div class="field-code">${code}</div></div>
              <div class="field"><div class="field-label">Mot de passe</div><div class="field-pass">${password}</div></div>
            </div>
          </div>
          <div class="footer"><div class="footer-parent">👤 ${parentCode?.parent_name || ''}</div><div class="footer-hint">Scannez ou entrez le code</div></div>
        </div></body></html>`;
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch (e: any) { Alert.alert('Erreur', e.message); }
    setSharing(false);
  }

  async function shareCardImage() {
    setSharingImg(true);
    try {
      if (!parentCode?.parent_phone) { Alert.alert('Erreur', 'Aucun numéro'); setSharingImg(false); return; }
      let phone = parentCode.parent_phone.toString().replace(/\s/g,'').replace(/[-().]/g,'');
      if (phone.startsWith('00212')) phone = phone.substring(2);
      else if (phone.startsWith('0')) phone = '212' + phone.substring(1);
      else if (phone.startsWith('+')) phone = phone.substring(1);
      else if (!phone.startsWith('212')) phone = '212' + phone;
      setShowCard(true);
      await new Promise(r => setTimeout(r, 1200));
      const uri = await viewShotRef.current.capture();
      const destUri = FileSystem.documentDirectory + `card_${id}.png`;
      await FileSystem.copyAsync({ from: uri, to: destUri });
      setShowCard(false);
      const waUrl = `whatsapp://send?phone=${phone}`;
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) await Linking.openURL(waUrl);
      await new Promise(r => setTimeout(r, 1500));
      await Sharing.shareAsync(destUri, { mimeType: 'image/png', dialogTitle: `Carte de ${student?.full_name}` });
    } catch (e: any) { setShowCard(false); Alert.alert('Erreur', e.message); }
    setSharingImg(false);
  }

  async function sendWhatsAppMsg() {
    try {
      if (!parentCode?.parent_phone) { Alert.alert('Erreur', 'Aucun numéro'); return; }
      let phone = parentCode.parent_phone.toString().replace(/\s/g,'').replace(/[-().]/g,'');
      if (phone.startsWith('00212')) phone = phone.substring(2);
      else if (phone.startsWith('0')) phone = '212' + phone.substring(1);
      else if (phone.startsWith('+')) phone = phone.substring(1);
      else if (!phone.startsWith('212')) phone = '212' + phone;
      const message = `🎒 *SchoolBox - Accès Parent*\n\nBonjour *${parentCode?.parent_name || student?.full_name}*,\n\nVoici les informations d'accès de votre enfant *${student?.full_name}*:\n\n📚 Niveau: *${student?.level?.name || ''}*${student?.class?.name ? '\n🏫 Classe: *' + student?.class?.name + '*' : ''}\n\n📱 Code: *${parentCode?.code}*\n🔑 Mot de passe: *${parentCode?.password || ''}*\n\nTéléchargez *SchoolBox* et connectez-vous avec ce code.\n\n_Bonne scolarité! 🌟_`;
      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else Alert.alert('Erreur', 'WhatsApp non disponible');
    } catch (e: any) { Alert.alert('Erreur', e.message); }
  }

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <StatusBar barStyle="light-content" backgroundColor={NAV} />
        <ActivityIndicator size="large" color={NAV} />
      </View>
    );
  }

  const avatar = getAvatar(student?.full_name || '');
  const branchesDuNiveau = NIVEAU_BRANCHES[editNiveau] || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* Hidden ViewShot */}
      {showCard && (
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}
          style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <StudentCard student={student} parentCode={parentCode} />
        </ViewShot>
      )}

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.decCircle} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <IconBack size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Élève</Text>
            <Text style={styles.headerSub}>{student?.school?.name || ''}</Text>
          </View>
          <TouchableOpacity style={styles.deleteTopBtn} onPress={deleteStudent} disabled={deleting}>
            {deleting ? <ActivityIndicator color="white" size="small" /> : <IconTrash size={17} color="white" />}
          </TouchableOpacity>
        </View>

        {/* Avatar dans le header */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{avatar}</Text>
          </View>
          <Text style={styles.studentName}>{student?.full_name}</Text>
          <View style={styles.badgesRow}>
            {student?.level?.name && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{student.level.name}</Text>
              </View>
            )}
            {student?.class?.name && (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeGrayText}>{student.class.name}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── ACTION BUTTONS GRID ── */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={openEdit}>
            <View style={[styles.actionIcon, { backgroundColor: NAV }]}>
              <IconEdit size={18} color="white" />
            </View>
            <Text style={styles.actionLabel}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowQR(true)}>
            <View style={[styles.actionIcon, { backgroundColor: '#7c3aed' }]}>
              <IconQR size={18} color="white" />
            </View>
            <Text style={styles.actionLabel}>QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={shareCard} disabled={sharing}>
            <View style={[styles.actionIcon, { backgroundColor: RED }]}>
              {sharing ? <ActivityIndicator color="white" size="small" /> : <IconPDF size={18} color="white" />}
            </View>
            <Text style={styles.actionLabel}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={sendWhatsAppMsg}>
            <View style={[styles.actionIcon, { backgroundColor: '#25D366' }]}>
              <IconWhatsApp size={18} color="white" />
            </View>
            <Text style={styles.actionLabel}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={shareCardImage} disabled={sharingImg}>
            <View style={[styles.actionIcon, { backgroundColor: '#0369a1' }]}>
              {sharingImg ? <ActivityIndicator color="white" size="small" /> : <IconImage size={18} color="white" />}
            </View>
            <Text style={styles.actionLabel}>Carte</Text>
          </TouchableOpacity>
        </View>

        {/* ── ÉCOLE ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <IconSchool size={15} color={NAV} />
            <Text style={styles.infoCardTitle}>ÉCOLE</Text>
          </View>
          <View style={styles.infoRow}>
            {student?.school?.logo_url
              ? <Image source={{ uri: student.school.logo_url }} style={styles.schoolLogoImg} />
              : <View style={styles.schoolLogoPlaceholder}><Text style={{ fontSize: 18 }}>🏫</Text></View>
            }
            <Text style={styles.infoValue}>{student?.school?.name || '—'}</Text>
          </View>
        </View>

        {/* ── SCOLARITÉ ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <IconBook size={15} color={NAV} />
            <Text style={styles.infoCardTitle}>SCOLARITÉ</Text>
          </View>
          <View style={styles.infoRowBetween}>
            <Text style={styles.infoLabel}>Niveau</Text>
            <View style={styles.niveauChip}>
              <Text style={styles.niveauChipText}>{student?.level?.name || '—'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRowBetween}>
            <Text style={styles.infoLabel}>Classe / Branche</Text>
            <Text style={styles.infoValue}>{student?.class?.name || '—'}</Text>
          </View>
        </View>

        {/* ── PARENT ── */}
        {parentCode && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <IconUser size={15} color={NAV} />
              <Text style={styles.infoCardTitle}>PARENT</Text>
            </View>
            <View style={styles.infoRowBetween}>
              <Text style={styles.infoLabel}>Nom</Text>
              <Text style={styles.infoValue}>{parentCode.parent_name || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRowBetween}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{parentCode.parent_phone || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRowBetween}>
              <Text style={styles.infoLabel}>Code d'accès</Text>
              <View style={styles.codeChip}>
                <Text style={styles.codeChipText}>{parentCode.code}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRowBetween}>
              <Text style={styles.infoLabel}>Mot de passe</Text>
              <View style={[styles.codeChip, { backgroundColor: '#fef2f2' }]}>
                <Text style={[styles.codeChipText, { color: RED }]}>{parentCode.password || '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRowBetween}>
              <Text style={styles.infoLabel}>Statut</Text>
              <View style={[styles.statusChip, { backgroundColor: parentCode.is_active ? '#dcfce7' : '#f3f4f6' }]}>
                <View style={[styles.statusDot, { backgroundColor: parentCode.is_active ? '#16a34a' : '#9ca3af' }]} />
                <Text style={[styles.statusText, { color: parentCode.is_active ? '#16a34a' : '#9ca3af' }]}>
                  {parentCode.is_active ? 'Actif' : 'Inactif'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── INSCRIPTION ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <IconCalendar size={15} color={NAV} />
            <Text style={styles.infoCardTitle}>INSCRIPTION</Text>
          </View>
          <Text style={styles.infoValue}>
            {student?.created_at
              ? new Date(student.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
              : '—'}
          </Text>
        </View>

        {/* ── DELETE ── */}
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteStudent} disabled={deleting}>
          {deleting
            ? <ActivityIndicator color="white" />
            : <><IconTrash size={18} color="white" /><Text style={styles.deleteBtnText}>Supprimer cet élève</Text></>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── EDIT MODAL ── */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Modifier</Text>
                  <Text style={styles.modalSub}>Mise à jour des informations</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEdit(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>NOM ÉLÈVE</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Nom complet" placeholderTextColor="#9ca3af" />
              </View>

              <Text style={styles.fieldLabel}>NIVEAU</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {ALL_NIVEAUX.map(n => (
                    <TouchableOpacity key={n}
                      style={[styles.chip, editNiveau === n && styles.chipActive]}
                      onPress={() => { setEditNiveau(n); setEditBranche(''); }}>
                      <Text style={[styles.chipText, editNiveau === n && styles.chipTextActive]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {branchesDuNiveau.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>BRANCHE</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {branchesDuNiveau.map(b => (
                      <TouchableOpacity key={b}
                        style={[styles.chip, editBranche === b && styles.chipActive]}
                        onPress={() => setEditBranche(b)}>
                        <Text style={[styles.chipText, editBranche === b && styles.chipTextActive]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.fieldLabel}>NOM PARENT</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={editParentName} onChangeText={setEditParentName} placeholder="Nom du parent" placeholderTextColor="#9ca3af" />
              </View>

              <Text style={styles.fieldLabel}>TÉLÉPHONE PARENT</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.input} value={editParentPhone} onChangeText={setEditParentPhone} placeholder="0612345678" placeholderTextColor="#9ca3af" keyboardType="phone-pad" />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <><IconSave size={18} color="white" /><Text style={styles.saveBtnText}>Enregistrer</Text></>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── QR MODAL ── */}
      <Modal visible={showQR} animationType="fade" transparent>
        <View style={styles.qrOverlay}>
          <View style={styles.qrCard}>
            <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQR(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>{avatar}</Text>
            <Text style={styles.qrName}>{student?.full_name}</Text>
            <Text style={styles.qrSub}>{student?.level?.name}{student?.class?.name ? ' · ' + student?.class?.name : ''}</Text>
            <View style={styles.qrBox}>
              {parentCode?.code && (
                <QRCode ref={qrRef} value={parentCode.code} size={200} color={NAV} backgroundColor="white" />
              )}
            </View>
            <View style={styles.codeChip2}>
              <Text style={styles.codeChip2Text}>{parentCode?.code}</Text>
            </View>
            {parentCode?.password && (
              <View style={[styles.codeChip2, { backgroundColor: '#fef2f2' }]}>
                <Text style={[styles.codeChip2Text, { color: RED, fontSize: 14 }]}>🔑 {parentCode.password}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.exportQRBtn} onPress={exportQR}>
              <IconShare size={16} color="white" />
              <Text style={styles.exportQRBtnText}>Exporter QR Code</Text>
            </TouchableOpacity>
            <Text style={styles.qrHint}>Scanner pour accéder au compte parent</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f8fc' },

  // HEADER
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 16, overflow: 'hidden' },
  decCircle: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 90 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 1 },
  deleteTopBtn: { width: 40, height: 40, backgroundColor: 'rgba(229,62,62,0.25)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(229,62,62,0.3)' },

  // AVATAR IN HEADER
  avatarWrap: { alignItems: 'center', gap: 10 },
  avatarCircle: { width: 86, height: 86, borderRadius: 43, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)' },
  avatarEmoji: { fontSize: 48 },
  studentName: { fontSize: 22, fontWeight: '900', color: 'white' },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { color: 'white', fontWeight: '700', fontSize: 13 },
  badgeGray: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeGrayText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 },

  // SCROLL
  scroll: { padding: 16 },

  // ACTIONS GRID
  actionsGrid: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'space-between' },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  actionLabel: { fontSize: 10, fontWeight: '700', color: '#374151', textAlign: 'center' },

  // INFO CARDS
  infoCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.05)' },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  infoCardTitle: { fontSize: 11, fontWeight: '900', color: NAV, letterSpacing: 1.2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#718096', fontWeight: '600' },
  infoValue: { fontSize: 14, color: NAV, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  schoolLogoImg: { width: 36, height: 36, borderRadius: 10 },
  schoolLogoPlaceholder: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  niveauChip: { backgroundColor: NAV, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 5 },
  niveauChipText: { color: 'white', fontWeight: '800', fontSize: 13 },
  codeChip: { backgroundColor: '#eef2ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  codeChipText: { fontSize: 13, fontWeight: '900', color: NAV2, letterSpacing: 1 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  // DELETE BTN
  deleteBtn: { backgroundColor: RED, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4, shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  deleteBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '92%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: NAV },
  modalSub: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  modalCloseBtn: { width: 34, height: 34, backgroundColor: '#f3f4f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: '#374151', fontWeight: '700' },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8, marginTop: 16 },
  inputBox: { backgroundColor: '#f7f8fc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  input: { fontSize: 15, color: NAV, fontWeight: '600' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f7f8fc' },
  chipActive: { backgroundColor: NAV, borderColor: NAV },
  chipText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  chipTextActive: { color: 'white' },
  saveBtn: { backgroundColor: NAV, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, shadowColor: NAV, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },

  // QR MODAL
  qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrCard: { backgroundColor: 'white', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center' },
  qrCloseBtn: { alignSelf: 'flex-end', width: 34, height: 34, backgroundColor: '#f3f4f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qrName: { fontSize: 20, fontWeight: '900', color: NAV, marginBottom: 4, textAlign: 'center' },
  qrSub: { fontSize: 13, color: '#718096', fontWeight: '600', marginBottom: 20 },
  qrBox: { padding: 16, backgroundColor: 'white', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', marginBottom: 16 },
  codeChip2: { backgroundColor: '#eef2ff', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 8 },
  codeChip2Text: { fontSize: 18, fontWeight: '900', color: NAV2, letterSpacing: 2 },
  exportQRBtn: { backgroundColor: NAV, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 },
  exportQRBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },
  qrHint: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});