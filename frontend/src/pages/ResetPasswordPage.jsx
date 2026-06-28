import { ArrowLeft, BriefcaseBusiness, Eye, EyeOff, Network, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLockup from '../components/BrandLockup.jsx';
import { confirmPasswordReset } from '../lib/authApi.js';

const PASSWORD_HINT =
  'Use at least 8 characters with uppercase, lowercase, and a number.';

const highlights = [
  { icon: BriefcaseBusiness, label: 'Career applications' },
  { icon: Network, label: 'Talent network access' },
  { icon: ShieldCheck, label: 'Secure member tools' },
];

function AuthVisualPanel({ compact = false }) {
  return (
    <div className={`auth-visual-panel ${compact ? 'auth-visual-panel-compact' : ''}`}>
      <img
        src="/images/register1.avif"
        alt=""
        aria-hidden="true"
        className="auth-visual-image"
      />
      <div className="auth-visual-overlay" />

      <div className="auth-visual-content">
        {!compact && (
          <Link to="/" className="auth-visual-back">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to site
          </Link>
        )}

        <div className={compact ? 'auth-visual-brand-center' : 'auth-visual-brand'}>
          <BrandLockup size={compact ? 'md' : 'lg'} theme="dark" align={compact ? 'center' : 'left'} />
          {!compact && (
            <>
              <p className="auth-visual-copy">
                Join Traviona&apos;s member platform for careers, expert network access, and advisory opportunities.
              </p>
              <div className="auth-visual-tags">
                {highlights.map(({ icon: Icon, label }) => (
                  <span key={label} className="auth-visual-tag">
                    <Icon className="h-3.5 w-3.5 text-tide" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {!compact && (
          <p className="auth-visual-footnote">Professional consulting &amp; global insights</p>
        )}
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete, hint }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          placeholder={label}
          className="auth-input auth-input-password"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="auth-password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-[1.125rem] w-[1.125rem]" /> : <Eye className="h-[1.125rem] w-[1.125rem]" />}
        </button>
      </div>
      {hint && <p className="auth-field-hint">{hint}</p>}
    </div>
  );
}

function meetsPasswordRules(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const linkInvalid = !uid || !token;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!meetsPasswordRules(password)) {
      setError(PASSWORD_HINT);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset({ uid, token, new_password: password });
      setMessage('Your password has been reset. You can sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="lg:hidden">
          <AuthVisualPanel compact />
        </div>

        <aside className="auth-aside hidden lg:block" aria-hidden="true">
          <AuthVisualPanel />
        </aside>

        <section className="auth-panel">
          <Link to="/" className="auth-mobile-back lg:hidden">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to site
          </Link>

          <div className="auth-card">
            <h1 className="auth-title">Choose a new password</h1>
            <p className="auth-subtitle">
              Enter and confirm your new password below.
            </p>

            {linkInvalid && (
              <p className="auth-alert auth-alert-error">
                This reset link is invalid or incomplete. Request a new link from the sign-in page.
              </p>
            )}

            {error && <p className="auth-alert auth-alert-error">{error}</p>}
            {message && <p className="auth-alert auth-alert-success">{message}</p>}

            {!linkInvalid && !message && (
              <form className="auth-form" onSubmit={handleSubmit}>
                <PasswordField
                  id="reset-password"
                  label="New password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  hint={PASSWORD_HINT}
                />

                <PasswordField
                  id="reset-password-confirm"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />

                <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
                  {isSubmitting ? 'Saving…' : 'Reset password'}
                </button>
              </form>
            )}

            {message ? (
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="auth-primary-btn"
              >
                Go to sign in
              </button>
            ) : (
              <p className="auth-switch">
                Remember your password?{' '}
                <Link to="/login" className="auth-inline-link">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
