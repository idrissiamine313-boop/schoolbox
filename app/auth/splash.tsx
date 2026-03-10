import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const logoY = useRef(new Animated.Value(-200)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const ring1 = useRef(new Animated.Value(0.8)).current;
  const ring2 = useRef(new Animated.Value(0.6)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo ينزل من فوق
      Animated.parallel([
        Animated.spring(logoY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Rings تظهر
      Animated.parallel([
        Animated.spring(ring1, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
        Animated.spring(ring2, { toValue: 1, tension: 30, friction: 6, useNativeDriver: true }),
      ]),
      // Text يظهر
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      // Pause
      Animated.delay(900),
      // Fade out
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => router.replace('/auth/login' as any));
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: screenOpacity }]}>
      <View style={s.bg1} />
      <View style={s.bg2} />
      <View style={s.bg3} />

      <View style={s.center}>
        {/* Rings */}
        <Animated.View style={[s.ring2, { transform: [{ scale: ring2 }], opacity: ring2 }]} />
        <Animated.View style={[s.ring1, { transform: [{ scale: ring1 }], opacity: ring1 }]} />

        {/* Logo */}
        <Animated.View style={[s.logoWrap, { transform: [{ translateY: logoY }], opacity: logoOpacity }]}>
          <View style={s.logoBox}>
            <Text style={s.logoS}>S</Text>
            <Text style={s.logoB}>B</Text>
          </View>
          <View style={s.logoGlow} />
        </Animated.View>

        {/* Text */}
        <Animated.View style={[s.textWrap, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
          <Text style={s.brand}>
            <Text style={s.brandS}>SCHOOL</Text>
            <Text style={s.brandB}> BOX</Text>
          </Text>
          <Text style={s.tagline}>La solution scolaire intelligente</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d1f', justifyContent: 'center', alignItems: 'center' },
  bg1: { position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(15,35,86,0.5)' },
  bg2: { position: 'absolute', bottom: -100, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(229,62,62,0.06)' },
  bg3: { position: 'absolute', top: height * 0.4, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(15,35,86,0.3)' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  ring2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 0 },
  logoBox: { width: 110, height: 110, borderRadius: 32, backgroundColor: '#0f2356', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#0f2356', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  logoGlow: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(15,35,86,0.25)' },
  logoS: { fontSize: 46, fontWeight: '900', color: 'white' },
  logoB: { fontSize: 46, fontWeight: '900', color: '#e53e3e' },
  textWrap: { alignItems: 'center', marginTop: 28 },
  brand: { fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  brandS: { color: 'white' },
  brandB: { color: '#e53e3e' },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '500', letterSpacing: 0.5 },
});