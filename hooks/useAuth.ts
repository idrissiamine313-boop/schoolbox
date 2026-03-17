import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  appUser: any | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signInWithParentCode: (code: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export function useAuth() { return useContext(AuthContext); }

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session && !isFetching.current) {
        isFetching.current = true;
        await fetchAppUser(session.user.id);
        isFetching.current = false;
      } else if (!session) {
        setAppUser(null);
        setLoading(false);
        isFetching.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchAppUser(authId: string) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('app_users')
        .select('*')
        .eq('auth_id', authId)
        .single();
        console.log('APP USER DATA:', JSON.stringify(data)); // ← هنا
      if (data) {
        setAppUser(data);
        setLoading(false);
        return;
      }

      // إلا ماجاتش داتا — جرب بـ email
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;
      if (email) {
        const { data: data2 } = await supabase
          .from('app_users')
          .select('*')
          .eq('email', email)
          .single();
        if (data2) {
          // update auth_id تلقائياً
          await supabase.from('app_users').update({ auth_id: authId }).eq('id', data2.id);
          setAppUser(data2);
          setLoading(false);
          return;
        }
      }
    } catch {}

    setAppUser(null);
    setLoading(false);
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signInWithParentCode(code: string, password: string) {
    const { data, error } = await supabase
      .from('parent_codes')
      .select('*, student:students(*, school:schools(*), level:levels(name), class:classes(name))')
      .eq('code', code.toUpperCase())
      .single();
    if (error || !data) return { error: { message: 'Code incorrect' } };
    if (!data.is_active) return { error: { message: 'Code désactivé' } };
    if (password !== '' && data.password && password !== data.password) {
      return { error: { message: 'Mot de passe incorrect' } };
    }
    setAppUser({ ...data, role: 'parent' });
    setLoading(false);
    return { error: null };
  }

  async function signOut() {
    isFetching.current = false;
    setAppUser(null);
    setSession(null);
    setLoading(false);
    await supabase.auth.signOut();
  }

  return { session, appUser, loading, signInWithEmail, signInWithParentCode, signOut };
}