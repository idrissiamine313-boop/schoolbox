import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');
const REMEMBER_KEY = 'sb_remember_credentials';

const LANGS = {
  fr: {
    welcome: 'Bienvenue',
    subtitle: 'Connectez-vous à votre espace SchoolBox',
    tabCode: '🔑  Code parent',
    tabEmail: '📧  Email',
    labelCode: '🏷️  CODE UNIQUE',
    labelEmail: '📧  ADRESSE EMAIL',
    labelPass: '🔒  MOT DE PASSE',
    placeholderCode: 'Ex: SB-A3X9KP',
    placeholderEmail: 'votre@email.com',
    placeholderPass: 'Entrez votre mot de passe',
    remember: 'Se souvenir de moi',
    connect: 'Se connecter',
    qr: 'Code QR',
    guide: 'Guide vidéo',
    or: 'ou',
    errPass: 'Veuillez entrer votre mot de passe',
    errEmail: 'Veuillez entrer votre email',
    errCode: 'Veuillez entrer votre code parent',
    errLogin: 'Identifiants incorrects',
  },
  ar: {
    welcome: 'مرحباً بك',
    subtitle: 'سجل دخولك إلى فضاء SchoolBox',
    tabCode: '🔑  كود الوالدين',
    tabEmail: '📧  البريد الإلكتروني',
    labelCode: '🏷️  الكود الخاص',
    labelEmail: '📧  البريد الإلكتروني',
    labelPass: '🔒  كلمة المرور',
    placeholderCode: 'مثال: SB-A3X9KP',
    placeholderEmail: 'بريدك@الإلكتروني.com',
    placeholderPass: 'أدخل كلمة المرور',
    remember: 'تذكرني',
    connect: 'تسجيل الدخول',
    qr: 'رمز QR',
    guide: 'دليل فيديو',
    or: 'أو',
    errPass: 'أدخل كلمة المرور',
    errEmail: 'أدخل بريدك الإلكتروني',
    errCode: 'أدخل كود الوالدين',
    errLogin: 'بيانات غير صحيحة',
  },
  en: {
    welcome: 'Welcome Back',
    subtitle: 'Sign in to your SchoolBox space',
    tabCode: '🔑  Parent Code',
    tabEmail: '📧  Email',
    labelCode: '🏷️  UNIQUE CODE',
    labelEmail: '📧  EMAIL ADDRESS',
    labelPass: '🔒  PASSWORD',
    placeholderCode: 'Ex: SB-A3X9KP',
    placeholderEmail: 'your@email.com',
    placeholderPass: 'Enter your password',
    remember: 'Remember me',
    connect: 'Sign In',
    qr: 'QR Code',
    guide: 'Video Guide',
    or: 'or',
    errPass: 'Please enter your password',
    errEmail: 'Please enter your email',
    errCode: 'Please enter your parent code',
    errLogin: 'Invalid credentials',
  },
};

// ─── Floating Orb with pulse ────────────────────────────────────
function FloatingOrb({
  size, color, x, y, duration, delay = 0,
}: {
  size: number; color: string; x: number; y: number; duration: number; delay?: number;
}) {
  const move = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(move, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(move, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.15, duration: duration * 0.6, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0.9, duration: duration * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ]),
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const tX = move.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 25, -10] });
  const tY = move.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -20, 10] });

  return (
    <Animated.View
      style={{
        position: 'absolute', left: x, top: y, width: size, height: size,
        borderRadius: size / 2, backgroundColor: color,
        transform: [{ translateX: tX }, { translateY: tY }, { scale: pulse }],
      }}
    />
  );
}

// ─── Sparkle particle ───────────────────────────────────────────
function Sparkle({ delay, startX }: { delay: number; startX: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const opac = useRef(new Animated.Value(0)).current;
  const sz = 3 + Math.random() * 3;

  useEffect(() => {
    const run = () => {
      anim.setValue(0);
      opac.setValue(0);
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 3000 + Math.random() * 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opac, { toValue: 0.8, duration: 600, useNativeDriver: true }),
          Animated.delay(1500),
          Animated.timing(opac, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start(run);
    };
    const t = setTimeout(run, delay);
    return () => clearTimeout(t);
  }, []);

  const tY = anim.interpolate({ inputRange: [0, 1], outputRange: [height * 0.5, -30] });

  return (
    <Animated.View style={{
      position: 'absolute', left: startX, width: sz, height: sz,
      borderRadius: sz / 2, backgroundColor: 'rgba(37,99,235,0.35)',
      transform: [{ translateY: tY }], opacity: opac,
    }} />
  );
}

// ─── Shimmer line ───────────────────────────────────────────────
function ShimmerLine() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, []);
  const tX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width * 2] });
  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
      borderRadius: 1,
    }}>
      <Animated.View style={{
        width: 120, height: '100%', borderRadius: 1,
        backgroundColor: 'rgba(37,99,235,0.15)',
        transform: [{ translateX: tX }],
      }} />
    </Animated.View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────
export default function LoginScreen() {
  const [lang, setLang] = useState<'fr' | 'ar' | 'en'>('fr');
  const [activeTab, setActiveTab] = useState<'code' | 'email'>('code');
  const [email, setEmail] = useState('');
  const [parentCode, setParentCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { signInWithEmail, signInWithParentCode } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const t = LANGS[lang];
  const isRTL = lang === 'ar';

  // ─── Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-30)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(25)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(60)).current;
  const langFade = useRef(new Animated.Value(0)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.9)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  // Sparkles data
  const sparkles = useRef(
    Array.from({ length: 12 }, (_, i) => ({ id: i, x: Math.random() * width, delay: i * 400 }))
  ).current;

  useEffect(() => {
    loadSaved();

    // Entrance sequence
    Animated.sequence([
      // 1. Logo drops in with bounce
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
        Animated.spring(logoY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]),
      // 2. Title fades up
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(langFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 3. Card slides up
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardY, { toValue: 0, tension: 45, friction: 9, useNativeDriver: true }),
      ]),
      // 4. Button pops in
      Animated.parallel([
        Animated.spring(btnScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(btnFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, { toValue: 1.04, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(logoPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(tabIndicator, {
      toValue: activeTab === 'code' ? 0 : 1,
      tension: 68, friction: 10, useNativeDriver: true,
    }).start();
  }, [activeTab]);

  async function loadSaved() {
    try {
      const saved = await SecureStore.getItemAsync(REMEMBER_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.tab) setActiveTab(data.tab);
        if (data.email) setEmail(data.email);
        if (data.parentCode) setParentCode(data.parentCode);
        if (data.password) setPassword(data.password);
        if (data.lang) setLang(data.lang);
        setRemember(true);
      }
    } catch {}
  }

  async function handleLogin() {
    if (!password) { Alert.alert('Erreur', t.errPass); return; }
    setLoading(true);
    let result;
    if (activeTab === 'email') {
      if (!email) { Alert.alert('Erreur', t.errEmail); setLoading(false); return; }
      result = await signInWithEmail(email, password);
    } else {
      if (!parentCode) { Alert.alert('Erreur', t.errCode); setLoading(false); return; }
      result = await signInWithParentCode(parentCode, password);
    }
    setLoading(false);
    if (result.error) {
      Alert.alert('Erreur', result.error.message || t.errLogin);
    } else {
      if (remember)
        await SecureStore.setItemAsync(REMEMBER_KEY, JSON.stringify({ tab: activeTab, email, parentCode, password, lang }));
      else await SecureStore.deleteItemAsync(REMEMBER_KEY);
      router.replace('/' as any);
    }
  }

  const tabTX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width - 80) / 2],
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />

      {/* ─── Gradient Background ─── */}
      <LinearGradient
        colors={['#F0F4FF', '#E8EEFF', '#F5F3FF', '#FFF5F5', '#F0F4FF']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── Animated Orbs ─── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FloatingOrb size={300} color="rgba(37,99,235,0.07)" x={-100} y={-80} duration={8000} />
        <FloatingOrb size={220} color="rgba(139,92,246,0.05)" x={width - 60} y={80} duration={10000} delay={500} />
        <FloatingOrb size={180} color="rgba(220,38,38,0.04)" x={width * 0.3} y={height * 0.55} duration={9000} delay={1000} />
        <FloatingOrb size={250} color="rgba(37,99,235,0.04)" x={-50} y={height * 0.4} duration={7000} delay={300} />
        <FloatingOrb size={120} color="rgba(16,185,129,0.04)" x={width * 0.7} y={height * 0.7} duration={6000} delay={800} />
        {/* Sparkle particles */}
        {sparkles.map(sp => <Sparkle key={sp.id} startX={sp.x} delay={sp.delay} />)}
      </View>

      {/* ─── Decorative top arc ─── */}
      <View style={s.topArc} pointerEvents="none">
        <LinearGradient
          colors={['rgba(37,99,235,0.08)', 'rgba(37,99,235,0)']}
          style={{ width: '100%', height: '100%' }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* ─── Language ─── */}
          <Animated.View style={[s.langContainer, { opacity: langFade }]}>
            <View style={s.langRow}>
              {(['fr', 'ar', 'en'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[s.langBtn, lang === l && s.langBtnActive]}
                  onPress={() => setLang(l)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.langTxt, lang === l && s.langTxtActive]}>
                    {l === 'fr' ? '🇫🇷' : l === 'ar' ? '🇲🇦' : '🇬🇧'} {l.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* ─── Logo ─── */}
          <Animated.View style={[s.logoSection, {
            transform: [{ scale: Animated.multiply(logoScale, logoPulse) }, { translateY: logoY }],
          }]}>
            <View style={s.logoWrap}>
              {/* Outer glow rings */}
              <View style={s.logoRing3} />
              <View style={s.logoRing2} />
              <View style={s.logoRing1} />
              <View style={s.logoShadow} />
              <Image
                source={require('../../assets/images/logo.png')}
                style={s.logoImg}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* ─── Title ─── */}
          <Animated.View style={[s.titleSection, {
            opacity: titleFade, transform: [{ translateY: titleY }],
          }]}>
            <Text style={[s.welcomeText, isRTL && s.rtl]}>{t.welcome}</Text>
            <Text style={[s.subtitleText, isRTL && s.rtl]}>{t.subtitle}</Text>
          </Animated.View>

          {/* ─── Card ─── */}
          <Animated.View style={[s.card, {
            opacity: cardFade, transform: [{ translateY: cardY }],
          }]}>
            {/* Shimmer effect on card top */}
            <ShimmerLine />

            {/* ─── Tabs ─── */}
            <View style={s.tabsWrap}>
              <View style={s.tabsBg}>
                <Animated.View style={[s.tabSlider, { transform: [{ translateX: tabTX }] }]} />
                {(['code', 'email'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={s.tab}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>
                      {tab === 'code' ? t.tabCode : t.tabEmail}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ─── Inputs ─── */}
            <View style={s.inputs}>
              {activeTab === 'code' ? (
                <View>
                  <Text style={[s.label, isRTL && s.rtl]}>{t.labelCode}</Text>
                  <View style={[s.inputBox, focusedField === 'code' && s.inputBoxFocus]}>
                    {focusedField === 'code' && <View style={s.inputGlow} />}
                    <TextInput
                      style={[s.input, isRTL && s.rtlInput]}
                      value={parentCode}
                      onChangeText={setParentCode}
                      placeholder={t.placeholderCode}
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="characters"
                      onFocus={() => {
                        setFocusedField('code');
                        setTimeout(() => scrollRef.current?.scrollTo({ y: 220, animated: true }), 300);
                      }}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={[s.label, isRTL && s.rtl]}>{t.labelEmail}</Text>
                  <View style={[s.inputBox, focusedField === 'email' && s.inputBoxFocus]}>
                    {focusedField === 'email' && <View style={s.inputGlow} />}
                    <TextInput
                      style={[s.input, isRTL && s.rtlInput]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t.placeholderEmail}
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => {
                        setFocusedField('email');
                        setTimeout(() => scrollRef.current?.scrollTo({ y: 220, animated: true }), 300);
                      }}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              )}

              <View>
                <Text style={[s.label, isRTL && s.rtl]}>{t.labelPass}</Text>
                <View style={[s.inputBox, focusedField === 'password' && s.inputBoxFocus]}>
                  {focusedField === 'password' && <View style={s.inputGlow} />}
                  <TextInput
                    style={[s.input, { flex: 1 }, isRTL && s.rtlInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t.placeholderPass}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    onFocus={() => {
                      setFocusedField('password');
                      setTimeout(() => scrollRef.current?.scrollTo({ y: 300, animated: true }), 300);
                    }}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={s.eyeBtn} activeOpacity={0.6}>
                    <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ─── Remember ─── */}
            <TouchableOpacity
              style={[s.rememberRow, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => setRemember(p => !p)}
              activeOpacity={0.7}
            >
              <View style={[s.checkbox, remember && s.checkboxOn]}>
                {remember && <Text style={s.checkTxt}>✓</Text>}
              </View>
              <Text style={s.rememberTxt}>{t.remember}</Text>
            </TouchableOpacity>

            {/* ─── Login Button ─── */}
            <Animated.View style={{ opacity: btnFade, transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={s.loginOuter}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.loginGrad}
                >
                  {/* Button shimmer */}
                  <View style={s.btnShine} />
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={s.loginTxt}>{t.connect}</Text>
                      <View style={s.loginArrow}>
                        <Text style={s.loginArrowTxt}>→</Text>
                      </View>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* ─── Divider ─── */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divTxt}>{t.or}</Text>
              <View style={s.divLine} />
            </View>

            {/* ─── Alt Buttons ─── */}
            <View style={s.altRow}>
              <TouchableOpacity
                style={s.altBtn}
                onPress={() => router.push('/auth/video-guide' as any)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#F0F9FF', '#EFF6FF']}
                  style={s.altBtnInner}
                >
                  <Text style={s.altIcon}>🎬</Text>
                  <Text style={s.altLabel}>{t.guide}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.altBtn}
                onPress={() => router.push('/auth/qr-login' as any)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#F0F9FF', '#EFF6FF']}
                  style={s.altBtnInner}
                >
                  <Text style={s.altIcon}>⬜</Text>
                  <Text style={s.altLabel}>{t.qr}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const BLUE = '#2563EB';
const TXT = '#0F172A';
const TXT2 = '#475569';
const MUTED = '#94A3B8';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },

  topArc: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    borderBottomLeftRadius: 80, borderBottomRightRadius: 80, overflow: 'hidden',
  },

  scroll: {
    flexGrow: 1, paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },

  // ─── Lang
  langContainer: { alignItems: 'center', marginBottom: 6 },
  langRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 3,
    borderWidth: 1, borderColor: 'rgba(37,99,235,0.08)',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  langBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22 },
  langBtnActive: {
    backgroundColor: BLUE,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  langTxt: { fontSize: 12, fontWeight: '700', color: MUTED },
  langTxtActive: { color: '#FFF' },

  // ─── Logo
  logoSection: { alignItems: 'center', marginTop: 16, marginBottom: 10 },
  logoWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  logoRing3: {
    position: 'absolute', width: 140, height: 140, borderRadius: 44,
    borderWidth: 1, borderColor: 'rgba(37,99,235,0.04)',
  },
  logoRing2: {
    position: 'absolute', width: 128, height: 128, borderRadius: 40,
    borderWidth: 1.5, borderColor: 'rgba(37,99,235,0.08)',
  },
  logoRing1: {
    position: 'absolute', width: 116, height: 116, borderRadius: 36,
    borderWidth: 2, borderColor: 'rgba(37,99,235,0.12)',
  },
  logoShadow: {
    position: 'absolute', width: 98, height: 98, borderRadius: 30,
    backgroundColor: 'rgba(37,99,235,0.12)', top: 26, left: 24,
  },
  logoImg: {
    width: 100, height: 100, borderRadius: 30,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24,
  },

  // ─── Title
  titleSection: { alignItems: 'center', marginBottom: 24 },
  welcomeText: { fontSize: 32, fontWeight: '900', color: TXT, letterSpacing: -0.5, marginBottom: 8 },
  subtitleText: { fontSize: 14, fontWeight: '500', color: TXT2, letterSpacing: 0.3 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  // ─── Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24,
    borderWidth: 1, borderColor: 'rgba(37,99,235,0.06)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 30, elevation: 10,
    overflow: 'hidden',
  },

  // ─── Tabs
  tabsWrap: { marginBottom: 22 },
  tabsBg: {
    flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4,
    position: 'relative',
  },
  tabSlider: {
    position: 'absolute', top: 4, left: 4,
    width: (width - 80) / 2, height: '100%',
    backgroundColor: BLUE, borderRadius: 13,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center', zIndex: 1 },
  tabTxt: { fontSize: 13, fontWeight: '700', color: MUTED },
  tabTxtActive: { color: '#FFF' },

  // ─── Inputs
  inputs: { gap: 16 },
  label: { fontSize: 10, fontWeight: '800', color: TXT2, letterSpacing: 1.8, marginBottom: 8, marginLeft: 4 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  inputBoxFocus: {
    borderColor: BLUE, backgroundColor: '#EFF6FF',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  inputGlow: {
    position: 'absolute', left: -20, top: -20, width: 80, height: 80,
    borderRadius: 40, backgroundColor: 'rgba(37,99,235,0.06)',
  },
  input: { flex: 1, fontSize: 15, color: TXT, fontWeight: '500', paddingVertical: 16, paddingRight: 12 },
  rtlInput: { textAlign: 'right' },
  eyeBtn: { padding: 10, marginRight: -8 },

  // ─── Remember
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 22 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 1.5,
    borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  checkboxOn: { backgroundColor: BLUE, borderColor: BLUE },
  checkTxt: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  rememberTxt: { fontSize: 13, fontWeight: '600', color: TXT2 },

  // ─── Login
  loginOuter: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 14,
  },
  loginGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 12, overflow: 'hidden',
  },
  btnShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 80, borderBottomRightRadius: 80,
  },
  loginTxt: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  loginArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  loginArrowTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // ─── Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  divTxt: { fontSize: 12, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 1 },

  // ─── Alt
  altRow: { flexDirection: 'row', gap: 12 },
  altBtn: {
    flex: 1, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(37,99,235,0.08)',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  altBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, gap: 8,
  },
  altIcon: { fontSize: 20 },
  altLabel: { fontSize: 13, fontWeight: '700', color: TXT2 },
});
