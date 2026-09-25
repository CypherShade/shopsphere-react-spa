import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEMO_USER, useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true }); // return to the page the guard intercepted
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="container page auth-page">
      <form className="card auth-card stack" onSubmit={onSubmit} noValidate>
        <h1>Welcome back</h1>
        {location.state?.from && (
          <p className="notice">Please sign in to continue to <code>{from}</code>.</p>
        )}
        <label className="field">
          <span>Username</span>
          <input name="username" autoComplete="username" value={form.username} onChange={onChange} required minLength={3} />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} required minLength={6} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" className="btn btn--ghost btn--block" onClick={() => setForm(DEMO_USER)}>
          Use demo account ({DEMO_USER.username} / {DEMO_USER.password})
        </button>
      </form>
    </div>
  );
}
