import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'fr' | 'ar' | 'en';
const LANG_KEY = 'sb_lang';

const translations = {
  fr: {
    welcome: 'Bienvenue', subtitle: 'Connectez-vous à votre espace',
    tabCode: 'Code parent', tabEmail: 'Email',
    labelCode: 'CODE UNIQUE', labelEmail: 'EMAIL', labelPass: 'MOT DE PASSE',
    placeholderCode: 'SB-A3X9KP', placeholderEmail: 'admin@schoolbox.ma', placeholderPass: '••••••••',
    remember: 'Se souvenir de moi', connect: 'SE CONNECTER', qr: 'Scanner un QR code',
    errPass: 'Entrez votre mot de passe', errEmail: 'Entrez votre email',
    errCode: 'Entrez votre code', errLogin: 'Identifiants incorrects',
    logout: 'Déconnexion', logoutMsg: 'Voulez-vous vous déconnecter ?',
    cancel: 'Annuler', confirm: 'Déconnecter',
  },
  ar: {
    welcome: 'مرحباً', subtitle: 'سجل دخولك إلى فضائك',
    tabCode: 'كود الوالدين', tabEmail: 'البريد',
    labelCode: 'الكود الخاص', labelEmail: 'البريد الإلكتروني', labelPass: 'كلمة السر',
    placeholderCode: 'SB-A3X9KP', placeholderEmail: 'admin@schoolbox.ma', placeholderPass: '••••••••',
    remember: 'تذكرني', connect: 'تسجيل الدخول', qr: 'مسح رمز QR',
    errPass: 'أدخل كلمة السر', errEmail: 'أدخل بريدك الإلكتروني',
    errCode: 'أدخل الكود', errLogin: 'بيانات غير صحيحة',
    logout: 'تسجيل الخروج', logoutMsg: 'هل تريد تسجيل الخروج؟',
    cancel: 'إلغاء', confirm: 'خروج',
  },
  en: {
    welcome: 'Welcome', subtitle: 'Sign in to your space',
    tabCode: 'Parent Code', tabEmail: 'Email',
    labelCode: 'UNIQUE CODE', labelEmail: 'EMAIL', labelPass: 'PASSWORD',
    placeholderCode: 'SB-A3X9KP', placeholderEmail: 'admin@schoolbox.ma', placeholderPass: '••••••••',
    remember: 'Remember me', connect: 'SIGN IN', qr: 'Scan QR code',
    errPass: 'Enter your password', errEmail: 'Enter your email',
    errCode: 'Enter your code', errLogin: 'Incorrect credentials',
    logout: 'Logout', logoutMsg: 'Do you want to logout?',
    cancel: 'Cancel', confirm: 'Logout',
  },
};

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations.fr;
  langLoading: boolean;
}

const LangContext = createContext<LangContextType>({} as LangContextType);
export function useLang() { return useContext(LangContext); }

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');
  const [langLoading, setLangLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(LANG_KEY).then(saved => {
      if (saved && ['fr', 'ar', 'en'].includes(saved)) {
        setLangState(saved as Lang);
      }
    }).catch(() => {}).finally(() => setLangLoading(false));
  }, []);

  async function setLang(l: Lang) {
    setLangState(l);
    await SecureStore.setItemAsync(LANG_KEY, l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang], langLoading }}>
      {children}
    </LangContext.Provider>
  );
}