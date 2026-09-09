import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Dashboard } from '../components/Dashboard';

export function ViewerPage() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (ready && !session) {
      navigate('/');
    }
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return null;
  }

  return <Dashboard readOnly={true} />;
}
