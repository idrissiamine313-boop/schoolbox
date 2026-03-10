import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const GREEN = '#059669';
const ORANGE = '#d97706';
const PURPLE = '#7c3aed';

function IconLogout({ size = 20, color = '#fc8181' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M21 12H9" stroke={color} strokeWidth={2.2} strokeLinecap="round" /></Svg>; }
function IconBook({ size = 28, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconBox({ size = 28, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 8L12 3 3 8v8l9 5 9-5V8z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M12 3v18" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M3 8l9 5 9-5" stroke={color} strokeWidth={2} strokeLinejoin="round" /></Svg>; }
function IconBell({ size = 28, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCart({ size = 28, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M3 6h18" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconList({ size = 22, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconSchool({ size = 22, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 9.5L12 4l9 5.5V20H3V9.5z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M9 20v-6h6v6" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Rect x="10" y="9" width="4" height="4" rx="0.5" stroke={color} strokeWidth={1.8} /></Svg>; }
function IconUser({ size = 22, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} /></Svg>; }
function IconChevron({ size = 16, color = '#9ca3af' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bonjour';
  if (h >= 12 && h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function ParentHome() {
  const router = useRouter();
  const { appUser, signOut } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      // جيب معلومات الطالب
      if (appUser?.student_id) {
        const { data: stu } = await supabase
          .from('students')
          .select('*, school:schools(id, name, logo_url, abbreviation), level:levels(name), class:classes(section)')
          .eq('id', appUser.student_id)
          .single();
        setStudent(stu);
        setSchool(stu?.school);
      }

      // عدد الطلبات الجارية
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('parent_code_id', appUser?.id)
        .in('status', ['en_preparation', 'en_attente']);
      setPendingOrders(count || 0);
    } catch {}
    setLoading(false);
  }

  async function handleLogout() {
    await signOut();
    router.replace('/auth/login' as any);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f8fc' }}>
        <ActivityIndicator color={NAV} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.dec1} /><View style={s.dec2} />

        {/* Top row: logos + logout */}
        <View style={s.topRow}>
          {/* Logo SB */}
          <View style={s.sbLogo}>
            <Text style={s.sbS}>S</Text>
            <Text style={s.sbB}>B</Text>
          </View>

          <View style={{ flex: 1 }} />

          {/* Logo école */}
          {school?.logo_url ? (
            <Image source={{ uri: school.logo_url }} style={s.schoolLogo} />
          ) : (
            <View style={[s.schoolLogo, { backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }]}>
              <IconSchool size={20} color="white" />
            </View>
          )}

          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <IconLogout size={18} color="#fc8181" />
          </TouchableOpacity>
        </View>

        {/* Profil élève */}
        <View style={s.profileCard}>
          {/* Photo élève */}
          <View style={s.photoWrap}>
            {student?.photo_url ? (
              <Image source={{ uri: student.photo_url }} style={s.photo} />
            ) : (
              <View style={[s.photo, { backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }]}>
                <IconUser size={32} color="rgba(255,255,255,0.7)" />
              </View>
            )}
            <View style={s.onlineDot} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{getGreeting()},</Text>
            <Text style={s.parentName}>{appUser?.parent_name || 'Parent'}</Text>
            <View style={s.studentInfo}>
              <Text style={s.studentName} numberOfLines={1}>
                👤 {student?.full_name || 'Élève'}
              </Text>
            </View>
            <View style={s.tagsRow}>
              {student?.level && (
                <View style={s.tag}>
                  <Text style={s.tagTxt}>{student.level.name}</Text>
                </View>
              )}
              {student?.class && (
                <View style={s.tag}>
                  <Text style={s.tagTxt}>{student.class.section}</Text>
                </View>
              )}
              {school && (
                <View style={[s.tag, { backgroundColor: 'rgba(229,62,62,0.3)' }]}>
                  <Text style={s.tagTxt}>{school.abbreviation || school.name}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Commandes en cours */}
        {pendingOrders > 0 && (
          <TouchableOpacity style={s.pendingBanner} onPress={() => router.push('/parent/commandes' as any)}>
            <View style={s.pendingDot} />
            <Text style={s.pendingTxt}>
              {pendingOrders} commande{pendingOrders > 1 ? 's' : ''} en cours
            </Text>
            <IconChevron size={14} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* SECTION TITRE */}
        <View style={s.sectionHeader}>
          <View style={s.sectionBar} />
          <Text style={s.sectionTitle}>Que souhaitez-vous ?</Text>
        </View>

        {/* MAIN ACTIONS */}
        <View style={s.actionsGrid}>

          {/* Fournitures */}
          <TouchableOpacity style={[s.actionCard, { backgroundColor: GREEN }]} onPress={() => router.push('/parent/fournitures' as any)} activeOpacity={0.88}>
            <View style={s.actionDec} />
            <View style={s.actionIconWrap}>
              <IconBook size={30} color="white" />
            </View>
            <Text style={s.actionTitle}>Fournitures</Text>
            <Text style={s.actionSub}>Listes scolaires</Text>
            <View style={s.actionArrow}><IconChevron size={14} color="rgba(255,255,255,0.7)" /></View>
          </TouchableOpacity>

          {/* Catalogue */}
          <TouchableOpacity style={[s.actionCard, { backgroundColor: PURPLE }]} onPress={() => router.push('/parent/catalogue' as any)} activeOpacity={0.88}>
            <View style={s.actionDec} />
            <View style={s.actionIconWrap}>
              <IconBox size={30} color="white" />
            </View>
            <Text style={s.actionTitle}>Catalogue</Text>
            <Text style={s.actionSub}>Produits scolaires</Text>
            <View style={s.actionArrow}><IconChevron size={14} color="rgba(255,255,255,0.7)" /></View>
          </TouchableOpacity>

        </View>

        {/* Annonces */}
        <TouchableOpacity style={s.annonceCard} onPress={() => router.push('/parent/annonces' as any)} activeOpacity={0.88}>
          <View style={s.annonceDec1} /><View style={s.annonceDec2} />
          <View style={s.annonceLeft}>
            <View style={s.annonceIconWrap}>
              <IconBell size={26} color="white" />
            </View>
            <View>
              <Text style={s.annonceTitle}>Annonces & Événements</Text>
              <Text style={s.annonceSub}>Actualités de l'école</Text>
            </View>
          </View>
          <IconChevron size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Mes commandes */}
        <TouchableOpacity style={s.commandesCard} onPress={() => router.push('/parent/commandes' as any)} activeOpacity={0.88}>
          <View style={s.commandesLeft}>
            <View style={[s.commandesIcon, { backgroundColor: '#eef2ff' }]}>
              <IconList size={22} color={NAV} />
            </View>
            <View>
              <Text style={s.commandesTitle}>Mes Commandes</Text>
              <Text style={s.commandesSub}>Suivi et historique</Text>
            </View>
          </View>
          {pendingOrders > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{pendingOrders}</Text>
            </View>
          )}
          <IconChevron size={16} color="#9ca3af" />
        </TouchableOpacity>

        {/* INFO ECOLE */}
        {school && (
          <View style={s.schoolCard}>
            <View style={s.sectionHeader}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>Mon école</Text>
            </View>
            <View style={s.schoolInfo}>
              {school.logo_url ? (
                <Image source={{ uri: school.logo_url }} style={s.schoolLogoLg} />
              ) : (
                <View style={[s.schoolLogoLg, { backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' }]}>
                  <IconSchool size={28} color={NAV} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.schoolName}>{school.name}</Text>
                {school.abbreviation && <Text style={s.schoolAbbr}>{school.abbreviation}</Text>}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { backgroundColor: NAV, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)' },
  dec2: { position: 'absolute', bottom: -40, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.03)' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  sbLogo: { flexDirection: 'row', width: 46, height: 46, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  sbS: { fontSize: 18, fontWeight: '900', color: 'white' },
  sbB: { fontSize: 18, fontWeight: '900', color: RED },
  schoolLogo: { width: 46, height: 46, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  logoutBtn: { width: 40, height: 40, backgroundColor: 'rgba(229,62,62,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(229,62,62,0.3)', marginLeft: 8 },
  profileCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  photoWrap: { position: 'relative' },
  photo: { width: 72, height: 72, borderRadius: 22, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.25)' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, backgroundColor: '#68d391', borderRadius: 7, borderWidth: 2, borderColor: NAV },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginBottom: 2 },
  parentName: { fontSize: 20, fontWeight: '900', color: 'white', marginBottom: 4 },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  studentName: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt: { fontSize: 10, fontWeight: '800', color: 'white' },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(229,62,62,0.2)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(229,62,62,0.3)' },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: RED },
  pendingTxt: { flex: 1, fontSize: 13, fontWeight: '700', color: 'white' },
  scroll: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 4 },
  sectionBar: { width: 4, height: 20, backgroundColor: RED, borderRadius: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: NAV },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionCard: { flex: 1, borderRadius: 20, padding: 16, paddingBottom: 20, overflow: 'hidden', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  actionDec: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  actionIconWrap: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  actionTitle: { fontSize: 16, fontWeight: '900', color: 'white', marginBottom: 3 },
  actionSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  actionArrow: { position: 'absolute', bottom: 14, right: 14 },
  annonceCard: { backgroundColor: ORANGE, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, overflow: 'hidden', shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  annonceDec1: { position: 'absolute', top: -20, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  annonceDec2: { position: 'absolute', bottom: -15, right: -10, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.08)' },
  annonceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  annonceIconWrap: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  annonceTitle: { fontSize: 15, fontWeight: '900', color: 'white' },
  annonceSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  commandesCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  commandesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  commandesIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  commandesTitle: { fontSize: 15, fontWeight: '900', color: NAV },
  commandesSub: { fontSize: 11, color: '#6b7280', fontWeight: '500', marginTop: 2 },
  badge: { backgroundColor: RED, borderRadius: 10, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeTxt: { fontSize: 11, fontWeight: '900', color: 'white' },
  schoolCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, shadowColor: NAV, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(15,35,86,0.06)' },
  schoolInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  schoolLogoLg: { width: 56, height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb' },
  schoolName: { fontSize: 15, fontWeight: '900', color: NAV },
  schoolAbbr: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginTop: 2 },
});