import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { appUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050d1f' }}>
        <ActivityIndicator size="large" color="#e53e3e" />
      </View>
    );
  }

 if (!appUser) return <Redirect href={'/auth/splash' as any} />;
  if (appUser.role === 'admin') return <Redirect href="/admin/dashboard" />;
  if (appUser.role === 'libraire') return <Redirect href="/libraire/dashboard" />;
  if (appUser.role === 'livreur') return <Redirect href="/driver/orders" />;
  if (appUser.role === 'parent') return <Redirect href="/parent/home" />;

  return <Redirect href={'/auth/splash' as any} />;
}