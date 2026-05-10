import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'superadmin', 'ppd', or 'guru'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    
    // Fetch user role from your 'profiles' table
    if (session?.user) {
      getUserRole(session.user.id);
    } else {
      setLoading(false);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await getUserRole(session.user.id);
      setLoading(false);
    });

    return () => authListener.unsubscribe();
  }, []);

  const getUserRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    setRole(data?.role);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);