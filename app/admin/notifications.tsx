import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { supabase } from '../../lib/supabase';

// تعريف نوع الـ Token باش TypeScript مايبكيش
interface PushToken {
  token: string;
}

export default function AdminNotifications() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendBroadcast() {
    if (!title.trim() || !message.trim()) {
      return Alert.alert('⚠️', 'عمر العنوان والرسالة!');
    }
    setLoading(true);

    try {
      // 1. نجيبو جميع الـ Tokens
      const { data: tokens, error } = await supabase
        .from('push_tokens')
        .select('token');

      if (error) throw error;
      
      if (!tokens || tokens.length === 0) {
        Alert.alert('ℹ️', 'ماكينش مستخدمين مسجلين للإشعارات.');
        setLoading(false);
        return;
      }

      // 2. نوجدو الميساجات
      const messages = tokens.map((t: any) => ({
        to: t.token,
        sound: 'default',
        title: title,
        body: message,
        data: { type: 'announcement' }
      }));

      // 3. نصيفطو لـ Expo
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages)
      });

      Alert.alert('✅', `تم إرسال الإعلان لـ ${tokens.length} شخص!`);
      setTitle('');
      setMessage('');

    } catch (err) {
      console.error("Erreur:", err);
      Alert.alert('❌', 'فشل الإرسال.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>📢 إرسال إعلان عام</Text>
      
      <Text style={s.label}>العنوان:</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="مثال: عطلة مدرسية" />
      
      <Text style={s.label}>الرسالة:</Text>
      <TextInput style={[s.input, s.textArea]} value={message} onChangeText={setMessage} multiline numberOfLines={4} placeholder="الرسالة..." />

      <TouchableOpacity style={[s.btn, loading && {opacity: 0.7}]} onPress={sendBroadcast} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'جاري الإرسال...' : 'إرسال للجميع 📨'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Text style={{color: '#666'}}>رجوع</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1E3A8A', textAlign: 'center', marginTop: 20 },
  label: { marginBottom: 5, fontWeight: '600', color: '#333' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  btn: { backgroundColor: '#1E3A8A', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  backBtn: { marginTop: 20, alignItems: 'center' }
});