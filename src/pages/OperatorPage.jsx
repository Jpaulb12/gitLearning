import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Dashboard } from '../components/Dashboard';

export function OperatorPage() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (ready && !session) {
      navigate('/');
    }
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return (
      <div className="min-h-screen bg-background p-6 text-muted-foreground">
        Loading…
      </div>
    );
  }

  const readOnly = session.role !== 'admin';
  return <Dashboard readOnly={readOnly} />;
}
