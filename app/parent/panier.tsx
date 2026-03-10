import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView,
    Platform, ScrollView, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0f2356';
const RED = '#e53e3e';
const GREEN = '#059669';
const ORANGE = '#d97706';
const PURPLE = '#7c3aed';

function IconBack({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconLocation({ size = 18, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={2} /><Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2} /></Svg>; }
function IconPhone({ size = 18, color = NAV }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCheck({ size = 22, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function IconCart({ size = 20, color = 'white' }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={2} strokeLinejoin="round" /><Path d="M3 6h18" stroke={color} strokeWidth={2} strokeLinecap="round" /><Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconGps({ size = 18, color = RED }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} /><Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} /><Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" /><Line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" /></Svg>; }
function IconShield({ size = 16, color = ORANGE }: any) { return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }

function generateQR(): string {
  return 'SB-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
}

export default function PanierParent() {
  const router = useRouter();
  const { appUser } = useAuth();
  const params = useLocalSearchParams();

  const type = params.type as string;
  const items = JSON.parse(params.itemsJson as string || '[]');
  const wrapping = params.wrapping === '1';
  const wrappingPrice = Number(params.wrappingPrice || 0);
  const total = Number(params.total || 0);
  const fournitureId = params.fournitureId as string;
  const fournitureName = params.fournitureName as string;

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(appUser?.parent_phone || '');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFourniture = type === 'fourniture';
  const color = isFourniture ? GREEN : PURPLE;

  async function getLocation() {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée', 'Autorisez la localisation'); setLocationLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocationLat(loc.coords.latitude);
      setLocationLng(loc.coords.longitude);
      // reverse geocode
      const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo[0]) {
        const g = geo[0];
        setAddress([g.street, g.streetNumber, g.city, g.region].filter(Boolean).join(', '));
      }
    } catch { Alert.alert('Erreur', 'Impossible d\'obtenir la localisation'); }
    setLocationLoading(false);
  }

  async function handleConfirm() {
    if (!address.trim()) { Alert.alert('Erreur', 'Entrez votre adresse de livraison'); return; }
    if (!phone.trim()) { Alert.alert('Erreur', 'Entrez votre numéro de téléphone'); return; }

    setLoading(true);
    console.log('items:', JSON.stringify(items));
console.log('total:', total);
    try {
      const qrCode = generateQR();

      const orderPayload: any = {
        parent_code_id: appUser?.id,
        student_id: appUser?.student_id,
        type,
        status: 'en_preparation',
        total_price: total,
        address: address.trim(),
        phone: phone.trim(),
        location_lat: locationLat,
        location_lng: locationLng,
        qr_code: qrCode,
        wrapping: wrapping,
      };

      if (isFourniture) orderPayload.fourniture_id = fournitureId;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // زيد les items
      const orderItems = items.map((item: any) => ({
  order_id: order.id,
  item_name: item.name,
  item_price: item.price,
  unit_price: item.price,
  quantity: item.quantity || 1,
  item_type: isFourniture ? 'fourniture_item' : 'product',
  fourniture_item_id: isFourniture ? item.id : null,
  product_id: !isFourniture ? item.id : null,
}));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setLoading(false);

      // روح لصفحة الreçu
      router.replace({
        pathname: '/parent/recu',
        params: { orderId: order.id }
      } as any);

    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue');
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      {/* HEADER */}
      <View style={[s.header, { backgroundColor: color }]}>
        <View style={s.dec1} /><View style={s.dec2} />
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><IconBack /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Récapitulatif</Text>
            <Text style={s.headerSub}>{isFourniture ? fournitureName : 'Catalogue'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ARTICLES */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Articles commandés</Text>
            {items.map((item: any, i: number) => (
              <View key={i} style={s.itemRow}>
                <View style={s.itemDot} />
                <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                {item.quantity > 1 && <Text style={s.itemQty}>x{item.quantity}</Text>}
                <Text style={s.itemPrice}>{(Number(item.price) * (item.quantity || 1)).toFixed(2)} MAD</Text>
              </View>
            ))}
            {wrapping && (
              <View style={[s.itemRow, { backgroundColor: '#fef3c7', borderRadius: 10, padding: 8, marginTop: 4 }]}>
                <IconShield size={14} color={ORANGE} />
                <Text style={[s.itemName, { color: ORANGE }]}>Protection cahiers</Text>
                <Text style={[s.itemPrice, { color: ORANGE }]}>+{wrappingPrice.toFixed(2)} MAD</Text>
              </View>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalAmt}>{total.toFixed(2)} MAD</Text>
            </View>
          </View>

          {/* LIVRAISON */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Informations de livraison</Text>

            <Text style={s.lbl}>TÉLÉPHONE *</Text>
            <View style={s.inputWrap}>
              <IconPhone size={16} color="#9ca3af" />
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="06 XX XX XX XX"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>

            <Text style={s.lbl}>ADRESSE DE LIVRAISON *</Text>
            <View style={[s.inputWrap, { alignItems: 'flex-start', paddingTop: 14 }]}>
              <IconLocation size={16} color="#9ca3af" />
              <TextInput
                style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Rue, quartier, ville..."
                placeholderTextColor="#9ca3af"
                multiline
              />
            </View>

            {/* Localisation GPS */}
            <TouchableOpacity style={s.gpsBtn} onPress={getLocation} disabled={locationLoading}>
              {locationLoading
                ? <ActivityIndicator color={RED} size="small" />
                : <IconGps size={18} color={locationLat ? GREEN : RED} />
              }
              <Text style={[s.gpsBtnTxt, locationLat !== null && { color: GREEN }]}>
                {locationLat ? '✓ Localisation obtenue' : 'Utiliser ma localisation GPS'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* RECAP */}
          <View style={[s.section, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <View style={s.recapRow}>
              <Text style={s.recapLabel}>Type de commande</Text>
              <Text style={s.recapVal}>{isFourniture ? '📚 Fournitures' : '🛍️ Catalogue'}</Text>
            </View>
            <View style={s.recapRow}>
              <Text style={s.recapLabel}>Articles</Text>
              <Text style={s.recapVal}>{items.length} article{items.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={s.recapRow}>
              <Text style={s.recapLabel}>Total à payer</Text>
              <Text style={[s.recapVal, { color: color, fontSize: 16, fontWeight: '900' }]}>{total.toFixed(2)} MAD</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CONFIRM BTN */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.confirmBtn, { backgroundColor: color }, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <>
                <IconCheck size={20} color="white" />
                <Text style={s.confirmTxt}>Confirmer la commande</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)' },
  dec2: { position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  scroll: { padding: 16 },
  section: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: NAV, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(15,35,86,0.05)' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: NAV, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: NAV + '40' },
  itemName: { flex: 1, fontSize: 13, color: NAV, fontWeight: '600' },
  itemQty: { fontSize: 12, color: '#6b7280', fontWeight: '700' },
  itemPrice: { fontSize: 13, fontWeight: '800', color: GREEN },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: '#f3f4f6' },
  totalLabel: { fontSize: 14, fontWeight: '800', color: NAV },
  totalAmt: { fontSize: 20, fontWeight: '900', color: NAV },
  lbl: { fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f7f8fc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e5e7eb' },
  input: { flex: 1, fontSize: 14, color: NAV, fontWeight: '500' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fecaca' },
  gpsBtnTxt: { fontSize: 13, fontWeight: '700', color: RED },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  recapLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  recapVal: { fontSize: 13, fontWeight: '800', color: NAV },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#f3f4f6', shadowColor: NAV, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  confirmBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  confirmTxt: { color: 'white', fontWeight: '900', fontSize: 15 },
});