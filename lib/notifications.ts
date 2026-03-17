import Constants from 'expo-constants';
import { supabase } from './supabase';

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: any = {}
) {
  // ما كيخدمش في Expo Go
  if (Constants.appOwnership === 'expo') return;
  
  try {
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error || !tokens || tokens.length === 0) return;

    const messages = tokens.map(t => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data,
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch {}
}