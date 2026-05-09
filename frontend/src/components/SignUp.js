import React, { useState, useRef } from 'react'
import './SignUp.css'

import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Create references for your inputs
  const nameRef = useRef();
  const surnameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleSignup = async (e) => {
    e.preventDefault(); // Stop the page from refreshing
    setError('');

    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const name = nameRef.current.value;
    const surname = surnameRef.current.value;

    // 2. Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // 3. Firebase Auth (Creates the "Identity")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // SMART URL LOGIC: Automatically switches between local testing and live deployment(before signup was hardcoded to localhost:5000/api)
      const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

      // 4. MongoDB Handshake (Creates the "Profile") using the smart URL
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: idToken,
          name: name,    // Crucial: Firebase doesn't know their name yet
          surname: surname, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info for the UI
        localStorage.setItem('token', idToken);
        localStorage.setItem('role', data.user.role); 
        navigate('/', { state: { justSignedUp: true } });
      } else {
        throw new Error(data.message || 'Database sync failed');
      }
     } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">

        <span aria-hidden="true" className="signup-bg-stripe"></span>
        <span aria-hidden="true" className="signup-bg-circle1"></span>
        <span aria-hidden="true" className="signup-bg-circle2"></span>

        <article className="signup-card">
        <header className="signup-logo-row">
          <figure className="signup-logo-mark">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path d="M10 20 L16 10 L22 20" stroke="#1A3A6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="16" cy="22" r="2" fill="#1A3A6B"/>
            </svg>
          </figure>
          <h1 className="signup-logo-text">StokvelStokkie</h1>
        </header>

        <h2 className="signup-headline">Create your account</h2>
        <p className="signup-sub">Join StokvelStokkie to easily manage your stokvel contributions, payouts, and group savings.</p>

        <hr className="signup-divider" />

        <form id="signup-form" onSubmit={handleSignup}>
        
        <input ref={nameRef} type="text" placeholder="Name" id="name_capture" required/>
        <input ref={surnameRef} type="text" placeholder="Surname" id="surname_capture" required/>
        
        {/* Note: removed height="1900px" as that's massive for an input! */}
        <input ref={emailRef} type="email" placeholder="Email Address" id="email_capture" required/>
        
        <input ref={passwordRef} type="password" placeholder="Password" id="password_capture" required/>
        <input ref={confirmPasswordRef} type="password" placeholder="Confirm Password" id="confirm_password_capture" required/>
        
        <hr className="signup-divider" />

        {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

        <button type="submit" id="sign_up_button" disabled={loading}>
          {loading ? 'Processing...' : 'Create Account'}
        </button>

        <p className="create-account-prompt">
          Already have an account? <a href="/">Sign in</a>.
        </p>
      </form>
        </article>

    </main>
  )
}
