import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Settings() {
  useDocumentTitle('Settings');
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saved, setSaved] = useState(false);

  const dirty = form.name !== user.name || form.email !== user.email;

  // Navigation guard: block in-app navigation while there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname
  );

  // ...and warn on tab close / reload as well
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const onSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name: form.name.trim() || user.name, email: form.email.trim() || user.email });
    setSaved(true);
  };

  const onChange = (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <div className="stack">
      <h1>Settings</h1>

      <form className="card pad stack" onSubmit={onSubmit}>
        <h2 className="h3">Profile</h2>
        <label className="field">
          <span>Display name</span>
          <input name="name" value={form.name} onChange={onChange} />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={onChange} />
        </label>
        <div className="row">
          <button className="btn btn--primary" disabled={!dirty}>Save changes</button>
          {dirty && <span className="muted small">You have unsaved changes. Leaving this page will ask for confirmation.</span>}
          {saved && !dirty && <span className="ok small" role="status">Saved ✓</span>}
        </div>
      </form>

      <div className="card pad stack">
        <h2 className="h3">Appearance</h2>
        <div className="row" role="radiogroup" aria-label="Theme">
          {['light', 'dark'].map((t) => (
            <label key={t} className="checkbox">
              <input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} />
              {t[0].toUpperCase() + t.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {blocker.state === 'blocked' && (
        <div className="modal-backdrop" role="presentation">
          <div className="card pad modal stack" role="alertdialog" aria-modal="true" aria-labelledby="leave-title">
            <h2 id="leave-title" className="h3">Discard unsaved changes?</h2>
            <p className="muted">Your profile edits haven't been saved yet.</p>
            <div className="row">
              <button className="btn btn--primary" onClick={() => blocker.reset()} autoFocus>
                Stay on page
              </button>
              <button className="btn btn--ghost" onClick={() => blocker.proceed()}>
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
