import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate, useAuth } from '../lib/auth';

export function Login() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (ready && session) {
      navigate(session.role === 'admin' ? '/operator' : '/viewer');
    }
  }, [ready, session, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    const role = authenticate(username, password);
    if (!role) {
      setErrorMessage('Incorrect username or password.');
      return;
    }

    navigate(role === 'admin' ? '/operator' : '/viewer');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="panel-card w-full max-w-sm">
        <h1 className="text-xl font-semibold">Delivery tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to continue. Sessions expire after 24 hours.
        </p>

        <div className="mt-5">
          <label className="field-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="field"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="field"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMessage && (
          <p className="mt-3 text-sm text-[var(--danger)]">{errorMessage}</p>
        )}

        <button type="submit" className="btn-primary mt-5 w-full">
          Sign in
        </button>
      </form>
    </div>
  );
}
