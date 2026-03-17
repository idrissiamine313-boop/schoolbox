import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, Text, View } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  
  // Animations Principales
  const logoY = useRef(new Animated.Value(-200)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const ring1 = useRef(new Animated.Value(0.8)).current;
  const ring2 = useRef(new Animated.Value(0.6)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  
  // Pro Touch 1: Shimmer Effect
  const shimmerValue = useRef(new Animated.Value(0)).current;

  // Pro Touch 2: Floating Particles
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Shimmer Loop
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Particles Loop
    // Hna sse7het l'erreur: zedt 'Animated.Value' type
    const createFloatAnim = (val: Animated.Value) => Animated.loop(
      Animated.sequence([
        Animated.timing(val, { toValue: 1, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    
    createFloatAnim(particle1).start();
    setTimeout(() => createFloatAnim(particle2).start(), 800);
    setTimeout(() => createFloatAnim(particle3).start(), 1500);
    setTimeout(() => createFloatAnim(particle4).start(), 2200);

    // 3. Main Sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(ring1, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
        Animated.spring(ring2, { toValue: 1, tension: 30, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      Animated.delay(900),
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => router.replace('/auth/login' as any));
  }, []);

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-130, 130],
  });

  return (
    <Animated.View style={[s.container, { opacity: screenOpacity }]}>
      <View style={s.bg1} />
      <View style={s.bg2} />
      <View style={s.bg3} />

      {/* Particles */}
      <Animated.View style={[s.particle, { transform: [{ translateY: particle1.interpolate({ inputRange: [0, 1], outputRange: [height, -20] }) }] }]} />
      <Animated.View style={[s.particle, { left: '20%', transform: [{ translateY: particle2.interpolate({ inputRange: [0, 1], outputRange: [height, -20] }) }] }]} />
      <Animated.View style={[s.particle, { left: '80%', transform: [{ translateY: particle3.interpolate({ inputRange: [0, 1], outputRange: [height, -20] }) }] }]} />
      <Animated.View style={[s.particle, { left: '60%', transform: [{ translateY: particle4.interpolate({ inputRange: [0, 1], outputRange: [height, -20] }) }] }]} />

      <View style={s.center}>
        {/* Rings */}
        <Animated.View style={[s.ring2, { transform: [{ scale: ring2 }], opacity: ring2 }]} />
        <Animated.View style={[s.ring1, { transform: [{ scale: ring1 }], opacity: ring1 }]} />

        {/* Logo Section */}
        <Animated.View style={[s.logoWrap, { transform: [{ translateY: logoY }], opacity: logoOpacity }]}>
          <View style={s.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={s.logoImage}
              resizeMode="cover" 
            />
            
            {/* Shimmer */}
            <Animated.View 
              style={[
                s.shimmer, 
                { transform: [{ translateX: shimmerTranslate }] }
              ]} 
            />
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
  bg1: { position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(15,35,86,0.15)' },
  bg2: { position: 'absolute', bottom: -100, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(229,62,62,0.06)' },
  bg3: { position: 'absolute', top: height * 0.4, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(15,35,86,0.08)' },
  
  center: { alignItems: 'center', justifyContent: 'center' },
  ring1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  ring2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  
  particle: {
    position: 'absolute',
    left: '40%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 0 },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    transform: [{ skewX: '-20deg' }],
  },
  logoGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(15,35,86,0.2)', zIndex: -1 },

  textWrap: { alignItems: 'center', marginTop: 28 },
  brand: { 
    fontSize: 28, 
    fontWeight: '900', 
    letterSpacing: 3, 
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  brandS: { color: 'white' },
  brandB: { color: '#e53e3e' },
  tagline: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.4)', 
    fontWeight: '500', 
    letterSpacing: 0.5 
  },
});