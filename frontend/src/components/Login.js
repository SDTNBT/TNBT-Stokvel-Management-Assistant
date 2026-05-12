import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  getAdditionalUserInfo,
  signOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(location.state?.justSignedUp ?? false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.justSignedUp) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    sessionStorage.removeItem('user');

    signOut(auth).catch((error) => {
      console.error('Error signing out of Firebase:', error);
    });
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => setShowModal(false), 8000);
    return () => clearTimeout(timer);
  }, [showModal]);

  const syncWithBackend = async (firebaseToken, firebaseEmail, firstName = '', lastName = '') => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: firebaseToken, name: firstName, surname: lastName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Server rejected login');
    }

    const cleanEmail = firebaseEmail.toLowerCase();

    localStorage.setItem('token', firebaseToken);
    localStorage.setItem('email', cleanEmail);
    sessionStorage.setItem('user', JSON.stringify({ ...data.user, email: cleanEmail }));

    navigate('/home');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const details = getAdditionalUserInfo(result);
      const googleFirstName = details?.profile?.given_name || '';
      const googleLastName = details?.profile?.family_name || '';

      const token = await result.user.getIdToken();
      const firebaseEmail = result.user.email;

      await syncWithBackend(token, firebaseEmail, googleFirstName, googleLastName);
    } catch (err) {
      console.error('Google Login Error:', err);
      setError('Google Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const firebaseEmail = userCredential.user.email;

      await syncWithBackend(token, firebaseEmail);
    } catch (err) {
      console.error('Manual Login Error:', err);
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <span aria-hidden="true" className="login-bg-circle1" />
      <span aria-hidden="true" className="login-bg-circle2" />
      <span aria-hidden="true" className="login-bg-stripe" />

      <article className="login-card">
        <header className="login-logo-row">
          <figure className="login-logo-mark">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="16" cy="22" r="2" fill="#1A3A6B" />
            </svg>
          </figure>
          <span className="login-logo-text">StokvelStokkie</span>
        </header>

        <h1 className="login-headline">Welcome back</h1>
        <p className="login-sub">Sign in to manage your stokvel contributions, payouts, and group savings.</p>

        <hr className="login-divider" />

        <form onSubmit={handleManualLogin}>
          <input
            type="email"
            placeholder="Email Address"
            id="email_capture"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            id="password_capture"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button type="submit" id="sign_in_button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="create-account-prompt">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>.
        </p>

        <hr className="smaller-login-divider" />

        <section className="login-google-wrapper" aria-label="Sign in options">
          {loading ? (
            <p className="login-loading-pill" role="status" aria-live="polite">
              <span className="login-spinner" aria-hidden="true" />
              Signing you in…
            </p>
          ) : (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="google-login-button"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <img
                src="/images/icons8-google-48.png"
                alt="Google logo"
                style={{ width: '20px', verticalAlign: 'middle', marginRight: '10px' }}
              />
              Continue with Google
            </button>
          )}
        </section>

        {error && (
          <p className="login-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <p className="login-fine-print">
          By signing in, you agree to StokvelStokkie&apos;s{' '}
          <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>.
        </p>

        <footer className="login-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1L8.8 5H13L9.5 7.6L10.9 12L7 9.4L3.1 12L4.5 7.6L1 5H5.2L7 1Z" fill="#F5C842" />
          </svg>
          Trusted by 200+ stokvel groups across South Africa
        </footer>
      </article>

      {showModal && (
        <aside className="signup-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <article className="signup-modal-card">
            <header className="signup-modal-header">
              <span className="signup-modal-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="14" fill="#EDFAF3" />
                  <path d="M8 14l4 4 8-8" stroke="#1A7A4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <button className="signup-modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                ×
              </button>
            </header>

            <section className="signup-modal-body">
              <h2 className="signup-modal-title" id="modal-title">You&apos;re in, welcome!</h2>
              <p className="signup-modal-msg">
                Your StokvelStokkie account is ready. Sign in to start managing your stokvel.
              </p>
            </section>

            <footer className="signup-modal-footer">
              <button className="signup-modal-continue" onClick={() => setShowModal(false)}>
                Continue to sign in
              </button>
            </footer>
          </article>
        </aside>
      )}

      <aside className="login-aside" aria-label="About StokvelStokkie">
        <section className="login-aside-content">
          <h2 className="login-aside-headline">Pool funds.<br />Build futures.</h2>
          <p className="login-aside-sub">
            StokvelStokkie digitises your rotating savings club — track contributions, payouts, and group savings.
          </p>
          <ul className="login-stats-list" aria-label="Platform statistics">
            {[
              { value: 'R0+', label: 'Managed monthly' },
              { value: '6+', label: 'Active members' },
              { value: '2%', label: 'Payout accuracy' }
            ].map((s) => (
              <li key={s.label} className="login-stat-item">
                <strong className="login-stat-value">{s.value}</strong>
                <span className="login-stat-label">{s.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </main>
  );
};