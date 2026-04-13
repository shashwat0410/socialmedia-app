import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons, Spinner } from '../components/common';

function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {dots.map((d) => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: `rgba(232,168,48,${Math.random() * 0.3 + 0.1})`,
            animation: `float${d.id % 3} ${d.duration}s ${d.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.1)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-14px) rotate(180deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(8px,-10px)} 66%{transform:translate(-6px,-18px)} }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await login(form.email, form.password);
    if (result.success) navigate('/');
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(er => ({ ...er, [k]: '' })); };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Particles />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, color: 'var(--white)', lineHeight: 1.1, marginBottom: 20 }}>
            Share your <br />
            <span style={{ color: 'var(--amber)', fontStyle: 'italic' }}>story.</span>
          </div>
          <p style={{ color: 'var(--gray-3)', fontSize: 16, maxWidth: 300, margin: '0 auto 40px' }}>
            Connect with creators, share moments, and build something beautiful.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✦ Real connections', '✦ Beautiful moments', '✦ Your story'].map(t => (
              <span key={t} className="badge badge-amber" style={{ fontSize: 13 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container fade-in">
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--amber)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Welcome back
            </div>
            <h1 className="auth-title">Sign in to<br />Luminary</h1>
            <p className="auth-subtitle">Your world awaits.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Icons.User className="input-icon" />
                <input
                  className="form-control"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 5 }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Icons.Settings className="input-icon" />
                <input
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-2)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 5 }}>{errors.password}</div>}
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: '13px', fontSize: 15 }}>
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', color: 'var(--gray-3)', fontSize: 14 }}>
            New to Luminary?{' '}
            <Link to="/register" style={{ color: 'var(--amber)', fontWeight: 600 }}>
              Create an account
            </Link>
          </p>

          <div style={{ marginTop: 24, padding: 14, background: 'var(--black-3)', borderRadius: 'var(--radius)', border: '1px solid rgba(232,168,48,0.1)' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Demo credentials</div>
            <div style={{ fontSize: 13, color: 'var(--gray-4)' }}>admin@socialmedia.com / Admin@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', userName: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name required';
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.userName || form.userName.length < 3) e.userName = 'Username must be at least 3 characters';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await register(form);
    if (result.success) navigate('/');
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(er => ({ ...er, [k]: '' })); };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Particles />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 700, color: 'var(--white)', lineHeight: 1.1, marginBottom: 20 }}>
            Begin your <br />
            <span style={{ color: 'var(--amber)', fontStyle: 'italic' }}>journey.</span>
          </div>
          <p style={{ color: 'var(--gray-3)', fontSize: 15, maxWidth: 280, margin: '0 auto' }}>
            Join thousands of creators sharing their world on Luminary.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container fade-in">
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--amber)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Get started
            </div>
            <h1 className="auth-title">Create your<br />account</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', autocomplete: 'name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' },
              { key: 'userName', label: 'Username', type: 'text', placeholder: 'janedoe', autocomplete: 'username' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '6+ characters', autocomplete: 'new-password' },
              { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
            ].map(({ key, label, type, placeholder, autocomplete }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-control"
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  autoComplete={autocomplete}
                />
                {errors[key] && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 5 }}>{errors[key]}</div>}
              </div>
            ))}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: 13, fontSize: 15 }}>
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', color: 'var(--gray-3)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
