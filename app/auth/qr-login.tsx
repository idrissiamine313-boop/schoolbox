import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, StatusBar, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';

const NAV = '#0f2356';
const RED = '#e53e3e';

function IconBack({ size = 20, color = 'white' }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconFlash({ size = 22, color = 'white' }: any) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function QRLogin() {
  const router = useRouter();
  const { signInWithParentCode } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const cooldown = useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  async function handleBarCodeScanned({ data }: { data: string }) {
  if (cooldown.current || scanned || loading) return;
  cooldown.current = true;
  setScanned(true);
  setLoading(true);

  try {
    const code = data.trim().toUpperCase();
    let password = '';

      const { error } = await signInWithParentCode(code, password);

      if (error) {
        Alert.alert('❌ Code invalide', error.message || 'QR Code non reconnu', [
          { text: 'Réessayer', onPress: () => { setScanned(false); setLoading(false); cooldown.current = false; } }
        ]);
      } else {
        router.replace('/parent/home' as any);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
      setScanned(false);
      setLoading(false);
      cooldown.current = false;
    }
  }

  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={RED} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={s.center}>
        <Text style={s.permText}>📷 Autorisez l'accès à la caméra</Text>
        <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
          <Text style={s.permBtnText}>Autoriser</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#9ca3af', fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay sombre */}
      <View style={s.overlay}>
        {/* TOP */}
        <View style={s.overlayTop}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <IconBack size={20} color="white" />
          </TouchableOpacity>
          <Text style={s.title}>Scanner le QR Code</Text>
          <TouchableOpacity style={[s.torchBtn, torch && s.torchActive]} onPress={() => setTorch(p => !p)}>
            <IconFlash size={20} color={torch ? NAV : 'white'} />
          </TouchableOpacity>
        </View>

        {/* MIDDLE — fenêtre transparente */}
        <View style={s.middle}>
          <View style={s.sideOverlay} />
          <View style={s.scanWindow}>
            {/* Coins du scanner */}
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />
            {loading && (
              <View style={s.scanLoading}>
                <ActivityIndicator color={RED} size="large" />
                <Text style={s.scanLoadingText}>Vérification...</Text>
              </View>
            )}
          </View>
          <View style={s.sideOverlay} />
        </View>

        {/* BOTTOM */}
        <View style={s.overlayBottom}>
          <Text style={s.hint}>
            {loading ? '⏳ Connexion en cours...' : '📱 Pointez vers le QR Code de votre carte'}
          </Text>
          <TouchableOpacity style={s.manualBtn} onPress={() => router.back()}>
            <Text style={s.manualBtnText}>Saisir manuellement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const WINDOW = 260;
const CORNER = 28;
const CORNER_W = 4;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, backgroundColor: '#050d1f', justifyContent: 'center', alignItems: 'center', gap: 16 },
  permText: { color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center', paddingHorizontal: 32 },
  permBtn: { backgroundColor: RED, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  permBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },

  overlay: { flex: 1 },
  overlayTop: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { flex: 1, color: 'white', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  torchBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  torchActive: { backgroundColor: 'white' },

  middle: { flexDirection: 'row', height: WINDOW },
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanWindow: { width: WINDOW, height: WINDOW, justifyContent: 'center', alignItems: 'center' },

  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: RED },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 6 },

  scanLoading: { alignItems: 'center', gap: 10 },
  scanLoadingText: { color: 'white', fontWeight: '700', fontSize: 14 },

  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 },
  hint: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  manualBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  manualBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});