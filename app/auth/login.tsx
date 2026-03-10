import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions,
  Easing, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');
const REMEMBER_KEY = 'sb_remember_credentials';

const LANGS = {
  fr: {
    welcome: 'Bienvenue',
    subtitle: 'Connectez-vous à votre espace',
    tabCode: 'Code parent',
    tabEmail: 'Email',
    labelCode: 'CODE UNIQUE',
    labelEmail: 'EMAIL',
    labelPass: 'MOT DE PASSE',
    placeholderCode: 'SB-A3X9KP',
    placeholderEmail: 'admin@schoolbox.ma',
    placeholderPass: '••••••••',
    remember: 'Se souvenir de moi',
    connect: 'SE CONNECTER',
    qr: 'Scanner un QR code',
    errPass: 'Entrez votre mot de passe',
    errEmail: 'Entrez votre email',
    errCode: 'Entrez votre code parent',
    errLogin: 'Identifiants incorrects',
  },
  ar: {
    welcome: 'مرحباً',
    subtitle: 'سجل دخولك إلى فضائك',
    tabCode: 'كود الوالدين',
    tabEmail: 'البريد',
    labelCode: 'الكود الخاص',
    labelEmail: 'البريد الإلكتروني',
    labelPass: 'كلمة السر',
    placeholderCode: 'SB-A3X9KP',
    placeholderEmail: 'admin@schoolbox.ma',
    placeholderPass: '••••••••',
    remember: 'تذكرني',
    connect: 'تسجيل الدخول',
    qr: 'مسح رمز QR',
    errPass: 'أدخل كلمة السر',
    errEmail: 'أدخل بريدك الإلكتروني',
    errCode: 'أدخل كود الوالدين',
    errLogin: 'بيانات غير صحيحة',
  },
  en: {
    welcome: 'Welcome',
    subtitle: 'Sign in to your space',
    tabCode: 'Parent Code',
    tabEmail: 'Email',
    labelCode: 'UNIQUE CODE',
    labelEmail: 'EMAIL',
    labelPass: 'PASSWORD',
    placeholderCode: 'SB-A3X9KP',
    placeholderEmail: 'admin@schoolbox.ma',
    placeholderPass: '••••••••',
    remember: 'Remember me',
    connect: 'SIGN IN',
    qr: 'Scan QR code',
    errPass: 'Enter your password',
    errEmail: 'Enter your email',
    errCode: 'Enter your parent code',
    errLogin: 'Incorrect credentials',
  },
};

// Particle component
function Particle({ delay, x }: { delay: number; x: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const size = Math.random() * 4 + 2;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 4000 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 800, delay: 2000, useNativeDriver: true }),
        ]),
      ]).start(loop);
    };
    const t = setTimeout(loop, delay);
    return () => clearTimeout(t);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [height * 0.7, -50] });

  return (
    <Animated.View style={{
      position: 'absolute', left: x, width: size, height: size,
      borderRadius: size / 2, backgroundColor: 'rgba(255,255,255,0.5)',
      transform: [{ translateY }], opacity: opacityAnim,
    }} />
  );
}

export default function LoginScreen() {
  const [lang, setLang] = useState<'fr' | 'ar' | 'en'>('fr');
  const [activeTab, setActiveTab] = useState<'code' | 'email'>('code');
  const [email, setEmail] = useState('');
  const [parentCode, setParentCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const { signInWithEmail, signInWithParentCode } = useAuth();
  const router = useRouter();
  const t = LANGS[lang];

  // Animations
  const headerAnim = useRef(new Animated.Value(-80)).current;
  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * width, delay: i * 300 }))
  ).current;

  useEffect(() => {
    loadSaved();
    checkBiometric();
    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, delay: 200, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 0, tension: 50, friction: 10, delay: 400, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  async function checkBiometric() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometric(compatible && enrolled);
  }

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

  async function handleBiometric() {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Connexion SchoolBox', cancelLabel: 'Annuler' });
    if (result.success) {
      const saved = await SecureStore.getItemAsync(REMEMBER_KEY);
      if (saved) {
        setLoading(true);
        const data = JSON.parse(saved);
        let res;
        if (data.tab === 'email') res = await signInWithEmail(data.email, data.password);
        else res = await signInWithParentCode(data.parentCode, data.password);
        setLoading(false);
        if (!res.error) router.replace('/' as any);
        else Alert.alert('Erreur', t.errLogin);
      } else Alert.alert('Info', 'Connectez-vous d\'abord avec vos identifiants');
    }
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
      if (remember) await SecureStore.setItemAsync(REMEMBER_KEY, JSON.stringify({ tab: activeTab, email, parentCode, password, lang }));
      else await SecureStore.deleteItemAsync(REMEMBER_KEY);
      router.replace('/' as any);
    }
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050d1f" />

      {/* Particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map(p => <Particle key={p.id} x={p.x} delay={p.delay} />)}
      </View>

      {/* Gradient circles */}
      <View style={s.glow1} />
      <View style={s.glow2} />
      <View style={s.glow3} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <Animated.View style={[s.header, { transform: [{ translateY: headerAnim }] }]}>
            {/* Lang selector */}
            <View style={s.langRow}>
              {(['fr', 'ar', 'en'] as const).map(l => (
                <TouchableOpacity key={l} style={[s.langBtn, lang === l && s.langBtnActive]} onPress={() => setLang(l)}>
                  <Text style={[s.langTxt, lang === l && s.langTxtActive]}>{l.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Logo */}
            <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
              <View style={s.logoInner}>
                <View style={s.logoRing} />
                <Text style={s.logoS}>S</Text>
                <Text style={s.logoB}>B</Text>
              </View>
              <View style={s.logoGlow} />
            </Animated.View>

            <Text style={[s.welcome, lang === 'ar' && { fontFamily: undefined }]}>{t.welcome}</Text>
            <Text style={s.subtitle}>{t.subtitle}</Text>
          </Animated.View>

          {/* CARD */}
          <Animated.View style={[s.card, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>

            {/* Tabs */}
            <View style={s.tabsWrap}>
              {(['code', 'email'] as const).map(tab => (
                <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]} onPress={() => setActiveTab(tab)}>
                  <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>
                    {tab === 'code' ? `🔑 ${t.tabCode}` : `✉️ ${t.tabEmail}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <View style={{ gap: 14 }}>
              {activeTab === 'code' ? (
                <View>
                  <Text style={s.lbl}>{t.labelCode}</Text>
                  <View style={s.inputWrap}>
                    <TextInput style={[s.input, lang === 'ar' && { textAlign: 'right' }]} value={parentCode} onChangeText={setParentCode} placeholder={t.placeholderCode} placeholderTextColor="rgba(255,255,255,0.25)" autoCapitalize="characters" />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={s.lbl}>{t.labelEmail}</Text>
                  <View style={s.inputWrap}>
                    <TextInput style={[s.input, lang === 'ar' && { textAlign: 'right' }]} value={email} onChangeText={setEmail} placeholder={t.placeholderEmail} placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="email-address" autoCapitalize="none" />
                  </View>
                </View>
              )}

              <View>
                <Text style={s.lbl}>{t.labelPass}</Text>
                <View style={s.inputWrap}>
                  <TextInput style={[s.input, { flex: 1 }, lang === 'ar' && { textAlign: 'right' }]} value={password} onChangeText={setPassword} placeholder={t.placeholderPass} placeholderTextColor="rgba(255,255,255,0.25)" secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Remember */}
            <TouchableOpacity style={s.rememberRow} onPress={() => setRemember(p => !p)}>
              <View style={[s.checkbox, remember && s.checkboxActive]}>
                {remember && <Text style={{ color: 'white', fontSize: 11, fontWeight: '900' }}>✓</Text>}
              </View>
              <Text style={s.rememberTxt}>{t.remember}</Text>
            </TouchableOpacity>

            {/* Login btn */}
            <TouchableOpacity style={[s.loginBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={s.loginBtnTxt}>{t.connect}</Text>}
            </TouchableOpacity>

            {/* Biometric + QR */}
            <View style={s.bottomRow}>
              {hasBiometric && (
                <TouchableOpacity style={s.bioBtn} onPress={handleBiometric}>
                  <Text style={{ fontSize: 26 }}>🔐</Text>
                  <Text style={s.bioBtnTxt}>Biométrie</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.bioBtn, { flex: hasBiometric ? undefined : 1 }]} onPress={() => router.push('/auth/qr-login' as any)}>
                <Text style={{ fontSize: 26 }}>▣</Text>
                <Text style={s.bioBtnTxt}>{t.qr}</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const NAV = '#0f2356';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d1f' },
  glow1: { position: 'absolute', top: -100, left: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(15,35,86,0.6)' },
  glow2: { position: 'absolute', top: 100, right: -120, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(229,62,62,0.08)' },
  glow3: { position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(15,35,86,0.4)' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 28, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 4 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  langBtnActive: { backgroundColor: NAV },
  langTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  langTxtActive: { color: 'white' },
  logoWrap: { marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
  logoInner: { width: 100, height: 100, borderRadius: 28, backgroundColor: NAV, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', shadowColor: NAV, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 16 },
  logoRing: { position: 'absolute', width: 118, height: 118, borderRadius: 34, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  logoGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(15,35,86,0.3)' },
  logoS: { fontSize: 42, fontWeight: '900', color: 'white' },
  logoB: { fontSize: 42, fontWeight: '900', color: '#e53e3e' },
  welcome: { fontSize: 32, fontWeight: '900', color: 'white', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' },
  tabsWrap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 4, marginBottom: 22, gap: 4 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 13, alignItems: 'center' },
  tabActive: { backgroundColor: NAV, shadowColor: NAV, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  tabTxt: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  tabTxtActive: { color: 'white' },
  lbl: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, fontSize: 15, color: 'white', fontWeight: '500' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 22 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: NAV, borderColor: NAV },
  rememberTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  loginBtn: { backgroundColor: '#e53e3e', borderRadius: 16, paddingVertical: 17, alignItems: 'center', shadowColor: '#e53e3e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  loginBtnTxt: { color: 'white', fontWeight: '900', fontSize: 15, letterSpacing: 2 },
  bottomRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  bioBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bioBtnTxt: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
});