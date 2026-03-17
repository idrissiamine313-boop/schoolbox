import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    ScrollView, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const NAV = '#0a1628';
const RED = '#ef4444';
const GOLD = '#f59e0b';
const GREEN = '#10b981';
const PURPLE = '#8b5cf6';

function IcoBack({ s = 22, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoPhone({ s = 18, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 10.5 19.79 19.79 0 01.65 2a2 2 0 012-2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
function IcoMap({ s = 18, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0" stroke={c} strokeWidth={2} />
  </Svg>;
}
function IcoCheck({ s = 20, c = 'white' }: any) {
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <Polyline points="20 6 9 17 4 12" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function generateQR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SB-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code + '-' + Date.now();
}

export default function Panier() {
  const router = useRouter();
  const { appUser } = useAuth();
  const params = useLocalSearchParams<{
    type: string;
    fourniture_id: string;
    fourniture_name: string;
    total: string;
    wrapping: string;
    product_id: string;
    product_name: string;
  }>();

  const [phone, setPhone] = useState(appUser?.parent_phone || '');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = parseFloat(params.total || '0');
  const isWrapping = params.wrapping === '1';
  const isFourniture = params.type === 'fourniture';
  const orderName = isFourniture ? params.fourniture_name : params.product_name;

  const schoolId = appUser?.student?.school_id || appUser?.student?.school?.id;

  async function getLocation() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Activez la localisation pour continuer.');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'obtenir la localisation.');
    }
    setLoadingLocation(false);
  }

  async function handleValider() {
    if (!phone.trim()) { Alert.alert('Erreur', 'Entrez votre numéro de téléphone.'); return; }
    if (!address.trim()) { Alert.alert('Erreur', 'Entrez votre adresse de livraison.'); return; }

    setSubmitting(true);
    try {
      const qrCode = generateQR();

      const orderData: any = {
        parent_code_id: appUser?.id,
        student_id: appUser?.student?.id,
        school_id: schoolId || null,
        type: isFourniture ? 'fourniture' : 'catalogue',
        status: 'en_preparation',
        total_price: total,
        phone: phone.trim(),
        address: address.trim(),
        notes: comment.trim() || null,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null,
        wrapping: isWrapping,
        qr_token: qrCode,
      };

      if (isFourniture && params.fourniture_id) {
        orderData.fourniture_id = params.fourniture_id;
      }

      if (!isFourniture && params.product_id) {
        orderData.product_id = params.product_id;
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error || !order) throw new Error('Erreur création commande');

      setSubmitting(false);
      router.replace({
        pathname: '/parent/recu',
        params: {
          order_id: order.id,
          qr_code: qrCode,
          total: total.toString(),
          order_name: orderName,
          phone: phone.trim(),
          address: address.trim(),
          destination: isFourniture ? 'libraire_admin' : 'admin_only',
        }
      } as any);

    } catch (e) {
      setSubmitting(false);
      Alert.alert('Erreur', 'Impossible de créer la commande. Réessayez.');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: NAV }]} />

        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <IcoBack s={22} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Finaliser la commande</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={s.content}>

            <View style={[s.destinationBadge, {
              backgroundColor: isFourniture ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
              borderColor: isFourniture ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)'
            }]}>
              <Text style={[s.destinationTxt, { color: isFourniture ? '#60a5fa' : PURPLE }]}>
                {isFourniture
                  ? '📚 Cette commande sera envoyée au libraire de votre école'
                  : '🛍️ Cette commande sera traitée par l\'administration'}
              </Text>
            </View>

            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>📦 Résumé</Text>
              <View style={s.summaryRow}>
                <Text style={s.summaryLbl}>{orderName}</Text>
                <Text style={s.summaryVal}>{total.toFixed(0)} DH</Text>
              </View>
              {isWrapping && (
                <View style={s.summaryRow}>
                  <Text style={s.summaryLbl}>🎁 Protection cahiers</Text>
                  <Text style={[s.summaryVal, { color: GREEN }]}>Inclus</Text>
                </View>
              )}
              <View style={s.summaryDivider} />
              <View style={s.summaryRow}>
                <Text style={s.summaryTotal}>Total</Text>
                <Text style={s.summaryTotalVal}>{total.toFixed(0)} DH</Text>
              </View>
            </View>

            <View style={s.inputCard}>
              <View style={s.inputLabel}>
                <View style={s.inputIcon}><IcoPhone s={16} c={PURPLE} /></View>
                <Text style={s.inputLabelTxt}>Numéro de téléphone</Text>
              </View>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="ex: 06 12 34 56 78"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="phone-pad"
              />
            </View>

            <View style={s.inputCard}>
              <View style={s.inputLabel}>
                <View style={s.inputIcon}><IcoMap s={16} c={GOLD} /></View>
                <Text style={s.inputLabelTxt}>Adresse de livraison</Text>
              </View>
              <TextInput
                style={s.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Rue, quartier, ville..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
              />
            </View>

            <TouchableOpacity
              style={[s.locationBtn, location && s.locationBtnActive]}
              onPress={getLocation}
              activeOpacity={0.85}
              disabled={loadingLocation}
            >
              {loadingLocation
                ? <ActivityIndicator color={GREEN} size="small" />
                : location
                  ? <><View style={s.locationCheck}><IcoCheck s={16} c="white" /></View>
                      <View>
                        <Text style={s.locationTxt}>📍 Localisation obtenue</Text>
                        <Text style={s.locationSub}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Text>
                      </View>
                    </>
                  : <><Text style={s.locationEmoji}>📍</Text>
                      <View>
                        <Text style={s.locationTxt}>Ajouter ma localisation GPS</Text>
                        <Text style={s.locationSub}>Pour une livraison précise</Text>
                      </View>
                    </>
              }
            </TouchableOpacity>

            <View style={s.inputCard}>
              <View style={s.inputLabel}>
                <Text style={{ fontSize: 16 }}>💬</Text>
                <Text style={s.inputLabelTxt}>Commentaire <Text style={s.facultatif}>(facultatif)</Text></Text>
              </View>
              <TextInput
                style={[s.input, { minHeight: 80 }]}
                value={comment}
                onChangeText={setComment}
                placeholder="Instructions spéciales, remarques..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                textAlignVertical="top"
              />
            </View>

          </View>
        </ScrollView>

        <View style={s.bottomBar}>
          <View style={s.bottomInfo}>
            <Text style={s.bottomLbl}>Total à payer</Text>
            <Text style={s.bottomPrice}>{total.toFixed(0)} DH</Text>
          </View>
          <TouchableOpacity
            style={[s.validerBtn, submitting && { opacity: 0.7 }]}
            onPress={handleValider}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting
              ? <ActivityIndicator color="white" size="small" />
              : <><IcoCheck s={20} c="white" /><Text style={s.validerTxt}>Valider</Text></>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAV },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 18, paddingBottom: 16, backgroundColor: 'rgba(10,22,40,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
  content: { padding: 18, gap: 14 },
  destinationBadge: { borderRadius: 14, padding: 14, borderWidth: 1.5 },
  destinationTxt: { fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  summaryCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  summaryTitle: { fontSize: 15, fontWeight: '900', color: 'white', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLbl: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', flex: 1 },
  summaryVal: { fontSize: 14, fontWeight: '800', color: 'white' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  summaryTotal: { fontSize: 15, fontWeight: '900', color: 'white' },
  summaryTotalVal: { fontSize: 20, fontWeight: '900', color: GOLD },
  inputCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputIcon: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  inputLabelTxt: { fontSize: 14, fontWeight: '800', color: 'white' },
  facultatif: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: 'white', fontSize: 14, fontWeight: '600', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.25)' },
  locationBtnActive: { backgroundColor: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.5)' },
  locationCheck: { width: 32, height: 32, backgroundColor: GREEN, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  locationEmoji: { fontSize: 28 },
  locationTxt: { fontSize: 14, fontWeight: '800', color: 'white' },
  locationSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10,22,40,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 18, paddingVertical: 14, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bottomInfo: { flex: 1 },
  bottomLbl: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  bottomPrice: { fontSize: 24, fontWeight: '900', color: GOLD },
  validerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: GREEN, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  validerTxt: { fontSize: 16, fontWeight: '900', color: 'white' },
});