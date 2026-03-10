import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LangProvider, useLang } from '../context/LanguageContext';
import { AuthContext, useAuthProvider } from '../hooks/useAuth';

function AppContent() {
  const { langLoading } = useLang();
  if (langLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050d1f' }}>
        <ActivityIndicator color="#e53e3e" size="large" />
      </View>
    );
  }
  return <Slot />;
}

export default function RootLayout() {
  const auth = useAuthProvider();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContext.Provider value={auth}>
        <LangProvider>
          <AppContent />
        </LangProvider>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}