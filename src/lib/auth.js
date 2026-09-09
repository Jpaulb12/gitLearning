import { useState, useEffect } from 'react';

const SESSION_KEY = 'delivery-tracker-session-v1';
const EXPIRY_MS = 86400000; // 24 hours

const ACCOUNTS = {
  admin: { password: 'nihemart@2026', role: 'admin' },
  user: { password: 'nihemart@20266', role: 'user' }
};

export function authenticate(username, password) {
  const cleanUser = (username || '').trim().toLowerCase();
  const account = ACCOUNTS[cleanUser];
  
  if (!account || account.password !== password) {
    return null;
  }

  const sessionData = {
    role: account.role,
    username: cleanUser,
    expiresAt: Date.now() + EXPIRY_MS
  };

  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.error('Failed to save session:', e);
  }

  return account.role;
}

export function logoutSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to remove session:', e);
  }
}

export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.expiresAt || Date.now() > data.expiresAt) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(() => getStoredSession());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
    setReady(true);

    const intervalId = window.setInterval(() => {
      setSession(getStoredSession());
    }, 30000);

    const handleStorage = (e) => {
      if (e.key === SESSION_KEY) {
        setSession(getStoredSession());
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    session,
    ready,
    refresh: () => setSession(getStoredSession())
  };
}
