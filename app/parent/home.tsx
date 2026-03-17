import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Dimensions, Image,
  RefreshControl, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const { width: W, height: H } = Dimensions.get('window');

const NAV = '#1E3A8A';
const BG = '#F4F7FC';
const RED = '#FF4B4B'; 
const GOLD = '#F5A623';
const GREEN = '#10B981';
const BLUE = '#3B82F6';
const PURPLE = '#8B5CF6';
const CYAN = '#06B6D4';
const PINK = '#EC4899';
const TEXT = '#1E293B';
const TEXT2 = '#64748B';

type Language = 'fr' | 'ar' | 'en';

interface Translations {
  bonjour: string;
  bonApresMidi: string;
  bonsoir: string;
  eleve: string;
  commandes: string;
  enPrepa: string;
  enRoute: string;
  livrees: string;
  totalDepense: string;
  fournitures: string;
  boutique: string;
  monQR: string;
  fournituresScolaires: string;
  boutiqueDeLEcole: string;
  actualitesEvenements: string;
  voirTout: string;
  evenement: string;
  annonce: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    bonjour: 'Bonjour',
    bonApresMidi: 'Bon après-midi',
    bonsoir: 'Bonsoir',
    eleve: 'Élève',
    commandes: 'Total',
    enPrepa: 'En prépa',
    enRoute: 'En route',
    livrees: 'Livrées',
    totalDepense: 'Total Dépensé',
    fournitures: 'Fournitures',
    boutique: 'Boutique',
    monQR: 'Mon QR',
    fournituresScolaires: '📚 Fournitures scolaires',
    boutiqueDeLEcole: '🛍️ Boutique de l\'école',
    actualitesEvenements: '📢 Actualités & Événements',
    voirTout: 'Voir tout',
    evenement: 'Événement',
    annonce: 'Annonce',
  },
  ar: {
    bonjour: 'صباح الخير',
    bonApresMidi: 'مساء الخير',
    bonsoir: 'مساء الخير',
    eleve: 'تلميذ',
    commandes: 'الكل',
    enPrepa: 'قيد التحضير',
    enRoute: 'في الطريق',
    livrees: 'تم التسليم',
    totalDepense: 'المبلغ المصروف',
    fournitures: 'اللوازم',
    boutique: 'المتجر',
    monQR: 'رمز QR',
    fournituresScolaires: '📚 اللوازم المدرسية',
    boutiqueDeLEcole: '🛍️ متجر المدرسة',
    actualitesEvenements: '📢 الأخبار والفعاليات',
    voirTout: 'عرض الكل',
    evenement: 'فعالية',
    annonce: 'إعلان',
  },
  en: {
    bonjour: 'Good morning',
    bonApresMidi: 'Good afternoon',
    bonsoir: 'Good evening',
    eleve: 'Student',
    commandes: 'Total',
    enPrepa: 'Preparing',
    enRoute: 'On the way',
    livrees: 'Delivered',
    totalDepense: 'Total Spent',
    fournitures: 'Supplies',
    boutique: 'Shop',
    monQR: 'My QR',
    fournituresScolaires: '📚 School Supplies',
    boutiqueDeLEcole: '🛍️ School Shop',
    actualitesEvenements: '📢 News & Events',
    voirTout: 'See all',
    evenement: 'Event',
    annonce: 'Announcement',
  },
};

function getGreeting(lang: Language) {
  const h = new Date().getHours();
  const t = translations[lang];
  if (h >= 5 && h < 12) return { text: t.bonjour, emoji: '🌅' };
  if (h >= 12 && h < 18) return { text: t.bonApresMidi, emoji: '☀️' };
  return { text: t.bonsoir, emoji: '🌙' };
}

function IcoLogout({ s = 18, c = 'white' }: any) {
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
      <Polyline points="16 17 21 12 16 7" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12H9" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function IcoEye({ c = TEXT2 }: any) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx={12} cy={12} r={3} />
    </Svg>
  );
}

function IcoEyeOff({ c = TEXT2 }: any) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1={1} y1={1} x2={23} y2={23} />
    </Svg>
  );
}

function IcoShop({ c = NAV }: any) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill={c}>
      <Path d="M2 9L3.5 4h17L22 9v2c0 .5-.2 1-.6 1.4L19 14.5V20H5v-5.5L2.6 12.4C2.2 12 2 11.5 2 11V9zm12 11V12h-4v8h4z"/>
    </Svg>
  );
}

function IcoBox({ c = NAV }: any) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></Path>
      <Polyline points="3.27 6.96 12 12.01 20.73 6.96"></Polyline>
      <Line x1="12" y1="22.08" x2="12" y2="12"></Line>
    </Svg>
  );
}

function IcoQR({ c = NAV }: any) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill={c}>
      <Path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
    </Svg>
  );
}

function IcoBook({ c = NAV }: any) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill={c}>
      <Path d="M21 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14v-2H7v-1h14V4zM5 18v-1H4v1h1z" />
      <Path d="M7 6h12v10H7z" opacity={0.3} />
    </Svg>
  );
}

function parseArr(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

function AnimatedBackground() {
  const circle1 = useRef(new Animated.Value(0)).current; const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current; const circle4 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animateCircle = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    animateCircle(circle1, 2000); animateCircle(circle2, 2500); 
    animateCircle(circle3, 3000); animateCircle(circle4, 2200);
  }, []);

  return (
    <View style={bgStyles.container} pointerEvents="none">
      <Animated.View style={[bgStyles.circle, { width: 200, height: 200, top: -60, left: -60, backgroundColor: BLUE + '20', transform: [{ scale: circle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] }) }] }]} />
      <Animated.View style={[bgStyles.circle, { width: 150, height: 150, top: 80, right: -40, backgroundColor: PURPLE + '18', transform: [{ scale: circle2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] }) }] }]} />
      <Animated.View style={[bgStyles.circle, { width: 180, height: 180, top: H * 0.45, left: -50, backgroundColor: PINK + '15', transform: [{ scale: circle3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] }) }] }]} />
      <Animated.View style={[bgStyles.circle, { width: 170, height: 170, bottom: -50, right: -20, backgroundColor: CYAN + '15', transform: [{ scale: circle4.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] }) }] }]} />
    </View>
  );
}

const bgStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 999 },
});

export default function ParentHome() {
  const router = useRouter();
  const { appUser, signOut } = useAuth();
  const student = appUser?.student;
  const school = student?.school;

  const [lang, setLang] = useState<Language>('fr');
  const t = translations[lang];
  
  const [showMoney, setShowMoney] = useState(true);
  const [stats, setStats] = useState({ total: 0, prep: 0, route: 0, livree: 0, depense: 0 });
  const [fournitures, setFournitures] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [sbLogo, setSbLogo] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAll();
    registerPushToken(); // ✅ تسجيل الـ token
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
      Animated.spring(cardsAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [appUser]);

  // ✅ تسجيل Push Token
  async function registerPushToken() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'ضع هنا projectId ديالك من app.json'
    })).data;
    
    console.log('PUSH TOKEN:', token);
    
    if (!appUser?.id || !token) return;
    await supabase.from('push_tokens').upsert(
      { user_id: appUser.id, token },
      { onConflict: 'user_id' }
    );
  } catch (e) {
    console.error('Push token error:', e);
  }
}

  async function loadAll() {
    setRefreshing(true);
    await Promise.all([loadStats(), loadFournitures(), loadProduits(), loadAnnonces(), loadSettings()]);
    setLoading(false);
    setRefreshing(false);
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.from('app_settings').select('key, value');
      if (data) {
        const logo = data.find(d => d.key === 'sb_logo_url');
        if (logo?.value?.startsWith('http')) setSbLogo(logo.value);
      }
    } catch {}
  }

  async function loadStats() {
    const sid = appUser?.student?.id;
    if (!sid) return;
    try {
      const { data } = await supabase.from('orders').select('status, total_price').eq('student_id', sid);
      if (data) {
        setStats({
          total: data.length,
          prep: data.filter((o: any) => o.status === 'en_preparation').length,
          route: data.filter((o: any) => o.status === 'en_attente').length,
          livree: data.filter((o: any) => o.status === 'livree').length,
          depense: data.filter((o: any) => o.status === 'livree')
            .reduce((s: number, o: any) => s + Number(o.total_price || 0), 0),
        });
        setCartCount(data.filter((o: any) => o.status === 'en_preparation').length);
      }
    } catch {}
  }

  async function loadFournitures() {
    const sid   = appUser?.student?.school_id  || appUser?.student?.school?.id;
    const lid   = appUser?.student?.level_id   || appUser?.student?.level?.id;
    try {
        const { data } = await supabase.from('fournitures')
          .select('id,name,price,image_url,school_ids,level_ids')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setFournitures((data || []).slice(0, 6));
    } catch {}
  }

  async function loadProduits() {
    try {
        const { data } = await supabase.from('products')
          .select('id,name,price,image_url,is_favoris')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setProduits((data || []).slice(0, 8));
    } catch {}
  }

  async function loadAnnonces() {
    try {
        const { data } = await supabase.from('announcements')
          .select('id,title,image_url,type')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setAnnonces((data || []).slice(0, 6));
    } catch {}
  }

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={NAV} size="large" />
    </View>
  );

  const greeting = getGreeting(lang);
  const isRTL = lang === 'ar';

  const navItems = [
    { label: t.fournitures, icon: <IcoBook c={NAV} />, route: '/parent/fournitures' },
    { label: t.boutique,    icon: <IcoShop c={NAV} />, route: '/parent/catalogue' },
    { label: t.commandes,   icon: <IcoBox c={NAV} />,  route: '/parent/commandes' },
    { label: t.monQR,       icon: <IcoQR c={NAV} />,   route: '/parent/qr' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={NAV} />
      <AnimatedBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll} tintColor={NAV} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={[s.headerBg, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }]
        }]}>
          
          <View style={s.langRow}>
            {(['fr', 'ar', 'en'] as Language[]).map((l) => (
              <TouchableOpacity key={l} style={[s.langBtn, lang === l && s.langBtnActive]} onPress={() => setLang(l)}>
                <Text style={s.langFlag}>{l === 'fr' ? '🇫🇷' : l === 'ar' ? '🇲🇦' : '🇬🇧'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[s.topBar, isRTL && s.rowReverse]}>
            <View style={s.logoWrapper}>
              {sbLogo
                ? <Image source={{ uri: sbLogo }} style={s.logoImg} resizeMode="contain" />
                : <Image source={require('../../assets/images/logo.jpg')} style={s.logoImg} resizeMode="contain" />
              }
            </View>
            <View style={s.schoolTitleWrap}>
              <Text style={s.schoolTitle} numberOfLines={1}>{school?.name?.toUpperCase() || 'SCHOOLBOX'}</Text>
            </View>
            <View style={s.logoWrapper}>
              {school?.logo_url
                ? <Image source={{ uri: school.logo_url }} style={s.logoImg} resizeMode="contain" />
                : <Text style={{ fontSize: 32 }}>🏫</Text>
              }
            </View>
          </View>

          <View style={[s.profileSection, isRTL && s.rowReverse]}>
            <View style={s.avatarContainer}>
              <Text style={s.avatarEmoji}>🎓</Text>
              <View style={s.onlineDot} />
            </View>
            <View style={[s.userInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[s.greetingText, isRTL && s.textRight]}>{greeting.emoji} {greeting.text}</Text>
              <Text style={[s.userName, isRTL && s.textRight]} numberOfLines={1}>{student?.full_name || t.eleve}</Text>
              <View style={[s.tagsContainer, isRTL && s.rowReverse]}>
                {student?.level?.name && <View style={[s.tag, { backgroundColor: BLUE + '30' }]}><Text style={s.tagText}>{student.level.name}</Text></View>}
                {student?.class?.name && <View style={[s.tag, { backgroundColor: PURPLE + '30' }]}><Text style={s.tagText}>{student.class.name}</Text></View>}
              </View>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity style={s.actionBtnLogout} onPress={async () => { await signOut(); router.replace('/auth/login' as any); }}>
                <IcoLogout s={16} />
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtnCart} onPress={() => router.push('/parent/commandes' as any)}>
                <Text style={s.cartEmoji}>🛒</Text>
                {cartCount > 0 && <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{cartCount}</Text></View>}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[s.statsContainer, {
          opacity: cardsAnim,
          transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
        }]}>
          <View style={[s.gridWrapper, isRTL && s.rowReverse]}>
            {[
              { label: t.commandes, value: stats.total },
              { label: t.enPrepa,   value: stats.prep },
              { label: t.enRoute,   value: stats.route },
              { label: t.livrees,   value: stats.livree },
            ].map((item, idx) => (
              <View key={idx} style={[
                s.statCard, 
                isRTL ? { borderRightColor: NAV, borderRightWidth: 4, alignItems: 'flex-end' } 
                      : { borderLeftColor: NAV, borderLeftWidth: 4, alignItems: 'flex-start' }
              ]}>
                <Text style={[s.statCount, { color: NAV }]}>{item.value}</Text>
                <Text style={s.statLabelNew} numberOfLines={1}>{item.label}</Text>
              </View>
            ))}
          </View>
          
          <View style={[
            s.depenseCard, 
            isRTL ? { borderRightColor: NAV, borderRightWidth: 4, flexDirection: 'row-reverse' } 
                  : { borderLeftColor: NAV, borderLeftWidth: 4, flexDirection: 'row' }
          ]}>
            <TouchableOpacity style={s.eyeBtnNew} onPress={() => setShowMoney(!showMoney)} activeOpacity={0.7}>
              {showMoney ? <IcoEye c={NAV} /> : <IcoEyeOff c={NAV} />}
            </TouchableOpacity>
            <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={s.depenseLabel}>{t.totalDepense}</Text>
              <Text style={s.depenseAmount}>
                {showMoney ? `${stats.depense.toFixed(2)} ` : '••••••• '}
                <Text style={{ fontSize: 13, color: TEXT2, fontWeight: '600' }}>DH</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[s.navGridContainer, isRTL && s.rowReverse, {
          opacity: cardsAnim,
          transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }]
        }]}>
          {navItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={s.navCard} onPress={() => router.push(item.route as any)} activeOpacity={0.7}>
              <View style={s.navIconWrapper}>{item.icon}</View>
              <Text style={s.navCardTitle}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {fournitures.length > 0 && (
          <View style={s.section}>
            <View style={[s.sectionHeader, isRTL && s.rowReverse]}>
              <Text style={s.sectionTitle}>{t.fournituresScolaires}</Text>
              <TouchableOpacity onPress={() => router.push('/parent/fournitures' as any)}>
                <Text style={s.sectionLink}>{t.voirTout}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.scrollHList, isRTL && { flexDirection: 'row-reverse' }]}>
              {fournitures.map(f => (
                <TouchableOpacity key={f.id} style={s.productCard} onPress={() => router.push({ pathname: '/parent/fourniture-detail', params: { id: f.id } } as any)}>
                  <View style={s.imageContainer}>
                    {f.image_url 
                      ? <Image source={{ uri: f.image_url }} style={s.productImage} /> 
                      : <View style={[s.productImage, s.imgPlaceholder]}><Text>📚</Text></View>
                    }
                    <View style={s.priceTag}>
                      <Text style={s.priceText}>{Number(f.price || 0).toFixed(0)} DH</Text>
                    </View>
                  </View>
                  <View style={s.productInfo}>
                    <Text style={[s.productTitle, isRTL && s.textRight]} numberOfLines={2}>{f.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {produits.length > 0 && (
          <View style={s.section}>
            <View style={[s.sectionHeader, isRTL && s.rowReverse]}>
              <Text style={s.sectionTitle}>{t.boutiqueDeLEcole}</Text>
              <TouchableOpacity onPress={() => router.push('/parent/catalogue' as any)}>
                <Text style={s.sectionLink}>{t.voirTout}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.scrollHList, isRTL && { flexDirection: 'row-reverse' }]}>
              {produits.map(p => (
                <TouchableOpacity key={p.id} style={s.productCard} onPress={() => router.push({ pathname: '/parent/product-detail', params: { id: p.id } } as any)}>
                  <View style={s.imageContainer}>
                    {p.image_url ? <Image source={{ uri: p.image_url }} style={s.productImage} /> : <View style={[s.productImage, s.imgPlaceholder]}><Text>🛍️</Text></View>}
                    {p.is_favoris && <View style={s.favoriBadge}><Text style={{fontSize: 10}}>⭐</Text></View>}
                  </View>
                  <View style={s.productInfo}>
                    <Text style={[s.productTitle, isRTL && s.textRight]} numberOfLines={2}>{p.name}</Text>
                    <Text style={[s.productPriceMain, isRTL && s.textRight]}>{Number(p.price || 0).toFixed(0)} DH</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {annonces.length > 0 && (
          <View style={s.section}>
            <View style={[s.sectionHeader, isRTL && s.rowReverse]}>
              <Text style={s.sectionTitle}>{t.actualitesEvenements}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.scrollHList, isRTL && { flexDirection: 'row-reverse' }]}>
              {annonces.map(a => (
                <TouchableOpacity key={a.id} style={s.newsCard} onPress={() => router.push({ pathname: '/parent/annonce-detail', params: { id: a.id } } as any)}>
                  {a.image_url ? <Image source={{ uri: a.image_url }} style={s.newsImage} /> : <View style={[s.newsImage, s.imgPlaceholder]}><Text>📰</Text></View>}
                  <View style={s.newsOverlay}>
                    <View style={[s.newsBadge, { backgroundColor: a.type === 'evenement' ? GOLD : RED }]}>
                      <Text style={s.newsBadgeTxt}>{a.type === 'evenement' ? t.evenement : t.annonce}</Text>
                    </View>
                    <Text style={[s.newsTitle, isRTL && s.textRight]} numberOfLines={2}>{a.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  headerBg: { 
    backgroundColor: NAV, paddingTop: 40, paddingBottom: 55,
    paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35,
    overflow: 'hidden', position: 'relative'
  },
  langRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, gap: 8 },
  langBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  langBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  langFlag: { fontSize: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logoWrapper: { width: 65, height: 65, backgroundColor: 'white', borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  logoImg: { width: '88%', height: '88%', borderRadius: 14 },
  schoolTitleWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  schoolTitle: { color: 'white', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, opacity: 0.9 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 12 },
  avatarEmoji: { fontSize: 30, backgroundColor: 'rgba(255,255,255,0.15)', width: 48, height: 48, textAlign: 'center', lineHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: GREEN, borderWidth: 2, borderColor: NAV },
  userInfo: { flex: 1 },
  greetingText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },
  userName: { color: 'white', fontSize: 17, fontWeight: '900', marginBottom: 5 },
  tagsContainer: { flexDirection: 'row', gap: 5 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tagText: { color: 'white', fontSize: 8, fontWeight: '700' },
  headerActions: { gap: 7, alignItems: 'center' },
  actionBtnLogout: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  actionBtnCart: { width: 40, height: 40, borderRadius: 13, backgroundColor: RED, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  cartEmoji: { fontSize: 18 },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: 'white', borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: RED },
  cartBadgeTxt: { fontSize: 8, fontWeight: '900', color: RED },
  statsContainer: { paddingHorizontal: 20, marginTop: -35, marginBottom: 10 },
  gridWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statCard: {
    flex: 1, marginHorizontal: 4, backgroundColor: 'white', borderRadius: 10, 
    paddingVertical: 10, paddingHorizontal: 6, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
  },
  statCount: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  statLabelNew: { fontSize: 8, color: TEXT2, fontWeight: '700', textTransform: 'uppercase' },
  depenseCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
    alignItems: 'center'
  },
  eyeBtnNew: { width: 42, height: 42, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  depenseLabel: { fontSize: 10, color: TEXT2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
  depenseAmount: { fontSize: 22, fontWeight: '900', color: NAV },
  navGridContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 10, marginBottom: 20 },
  navCard: { 
    width: (W - 45) / 4, backgroundColor: 'white', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 2, alignItems: 'center',
    borderBottomWidth: 4, borderBottomColor: NAV, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 3 
  },
  navIconWrapper: { width: 44, height: 44, backgroundColor: '#F0F4FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  navCardTitle: { fontSize: 9, fontWeight: '800', color: TEXT2, textAlign: 'center' },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: TEXT },
  sectionLink: { fontSize: 11, fontWeight: '700', color: BLUE },
  scrollHList: { paddingHorizontal: 20, gap: 10 },
  productCard: { width: 135, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  imageContainer: { width: 135, height: 120, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  imgPlaceholder: { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  priceTag: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  priceText: { fontSize: 10, fontWeight: '900', color: NAV },
  favoriBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'white', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  productInfo: { padding: 8 },
  productTitle: { fontSize: 11, fontWeight: '800', color: TEXT, lineHeight: 14 },
  productPriceMain: { fontSize: 13, fontWeight: '900', color: BLUE, marginTop: 4 },
  newsCard: { width: 220, height: 140, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  newsImage: { width: '100%', height: '100%' },
  newsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 30, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  newsBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 5 },
  newsBadgeTxt: { color: 'white', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  newsTitle: { color: 'white', fontSize: 13, fontWeight: '800', lineHeight: 16, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 }
});