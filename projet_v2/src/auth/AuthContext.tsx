import * as React from 'react';
import { authApi } from '../api/auth';
import api from '../api/axios';

export interface User {
  id: number;
  role: 'RH' | 'CHEF' | 'RESSOURCE';
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_img: string | null;
  company_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  paymentValidated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  validatePayment: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

function decodeJWT(token: string) {
  try {
    const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b));
  } catch { return null; }
}

const PAYMENT_DAYS = 30;
function isPaymentValid(): boolean {
  const ts = localStorage.getItem('payment_validated_at');
  if (!ts) return false;
  const diff = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24);
  return diff < PAYMENT_DAYS;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentValidated, setPaymentValidated] = React.useState<boolean>(isPaymentValid);
  const didMount = React.useRef(false);

  React.useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    const t = localStorage.getItem('token');
    if (t && !user) {
      api.get('/me').then(({ data }) => {
        const u: User = { id: data.id, role: data.role, company_id: data.company_id, first_name: data.first_name, last_name: data.last_name, email: data.email, profile_img: data.profile_img, company_name: data.company_name };
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
      }).catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      const rawToken: string = data.token;
      if (!decodeJWT(rawToken)) throw new Error('Token invalide');
      localStorage.setItem('token', rawToken); setToken(rawToken);
      const meRes = await api.get('/me');
      const u: User = { id: meRes.data.id, role: meRes.data.role, company_id: meRes.data.company_id, first_name: meRes.data.first_name, last_name: meRes.data.last_name, email: meRes.data.email, profile_img: meRes.data.profile_img, company_name: meRes.data.company_name };
      localStorage.setItem('user', JSON.stringify(u)); setUser(u);
      setPaymentValidated(isPaymentValid());
    } finally { setIsLoading(false); }
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/me');
      const u: User = { id: data.id, role: data.role, company_id: data.company_id, first_name: data.first_name, last_name: data.last_name, email: data.email, profile_img: data.profile_img, company_name: data.company_name };
      localStorage.setItem('user', JSON.stringify(u)); setUser(u);
    } catch { logout(); }
  };

  const validatePayment = () => { localStorage.setItem('payment_validated_at', new Date().toISOString()); setPaymentValidated(true); };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, paymentValidated, login, logout, refreshUser, validatePayment }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
