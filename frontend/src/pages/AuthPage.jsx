import { ArrowLeft, BriefcaseBusiness, Eye, EyeOff, Network, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLockup from '../components/BrandLockup.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { requestPasswordReset } from '../lib/authApi.js';
import { isGoogleAuthEnabled, requestGoogleAccessToken } from '../lib/googleAuth.js';
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

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function SocialButton({ provider, icon: Icon, onClick, disabled = false, loading = false, title = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className="auth-social-btn"
    >
      <Icon />
      <span>{loading ? 'Connecting…' : provider}</span>
    </button>
  );
}

function GoogleSignInButton({ onError, onClearNotice, disabled }) {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/';
  const [loading, setLoading] = useState(false);
  const enabled = isGoogleAuthEnabled();

  async function handleGoogleSignIn() {
    if (!enabled) {
      onError('Google Sign-In is not configured.');
      return;
    }

    setLoading(true);
    onError('');
    onClearNotice?.();

    try {
      const accessToken = await requestGoogleAccessToken();
      await socialLogin({ provider: 'google', access_token: accessToken });
      navigate(nextPath, { replace: true });
    } catch (err) {
      onError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SocialButton
      provider="Google"
      icon={GoogleIcon}
      onClick={handleGoogleSignIn}
      disabled={disabled || !enabled}
      loading={loading}
    />
  );
}

function LinkedInSignInButton({ onNotify, disabled }) {
  return (
    <SocialButton
      provider="LinkedIn"
      icon={LinkedInIcon}
      onClick={() => onNotify('Feature not enabled yet.')}
      disabled={disabled}
    />
  );
}

function AuthDivider({ label }) {
  return (
    <div className="auth-divider">
      <span>{label}</span>
    </div>
  );
}

function AuthField({ id, label, type = 'text', value, onChange, required = true, autoComplete, placeholder }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder || label}
        className="auth-input"
      />
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

function RecaptchaPlaceholder() {
  return (
    <div className="auth-recaptcha" aria-hidden="true">
      <div className="auth-recaptcha-box">
        <span className="auth-recaptcha-check" />
        <span className="auth-recaptcha-label">I&apos;m not a robot</span>
      </div>
      <div className="auth-recaptcha-badge">
        <span className="auth-recaptcha-icon">re</span>
        <span className="auth-recaptcha-meta">reCAPTCHA</span>
        <span className="auth-recaptcha-meta">Privacy · Terms</span>
      </div>
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

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();
  const nextPath = searchParams.get('next') || '/';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [showReset, setShowReset] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
    acceptCommunications: false,
  });
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    setShowReset(false);
    setError('');
    setNotice('');
  }, [initialMode]);

  function showFeatureNotice(text) {
    setError('');
    setMessage('');
    setNotice(text);
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath]);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      await login({
        username: loginForm.email.trim(),
        password: loginForm.password,
      });
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!registerForm.acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    if (!meetsPasswordRules(registerForm.password)) {
      setError(PASSWORD_HINT);
      return;
    }

    setIsSubmitting(true);
    const email = registerForm.email.trim().toLowerCase();

    try {
      await register({
        username: email,
        email,
        password: registerForm.password,
        first_name: registerForm.firstName.trim(),
        last_name: registerForm.lastName.trim(),
      });
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset(resetEmail.trim());
      setMessage('If that email exists, a reset link has been sent.');
      setShowReset(false);
    } catch (err) {
      setError(err.message || 'Unable to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRegister = initialMode === 'register';

  const formContent = (
    <div className="auth-card">
      {showReset ? (
        <>
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link.</p>

          {error && <p className="auth-alert auth-alert-error">{error}</p>}
          {message && <p className="auth-alert auth-alert-success">{message}</p>}

          <form className="auth-form" onSubmit={handleReset}>
            <AuthField
              id="reset-email"
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              autoComplete="email"
            />
            <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => setShowReset(false)} className="auth-text-link auth-text-link-center">
              Back to sign in
            </button>
          </form>
        </>
      ) : isRegister ? (
        <>
          <h1 className="auth-title">Sign up for Traviona Consulting</h1>

          <div className="auth-social-grid">
            <GoogleSignInButton onError={setError} onClearNotice={() => setNotice('')} disabled={isSubmitting} />
            <LinkedInSignInButton onNotify={showFeatureNotice} disabled={isSubmitting} />
          </div>

          <AuthDivider label="Manual sign up" />

          {notice && <p className="auth-alert auth-alert-info">{notice}</p>}
          {error && <p className="auth-alert auth-alert-error">{error}</p>}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field-row">
              <AuthField
                id="register-first-name"
                label="First Name"
                value={registerForm.firstName}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, firstName: event.target.value }))}
                autoComplete="given-name"
              />
              <AuthField
                id="register-last-name"
                label="Last Name"
                value={registerForm.lastName}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, lastName: event.target.value }))}
                autoComplete="family-name"
              />
            </div>

            <AuthField
              id="register-email"
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
            />

            <PasswordField
              id="register-password"
              label="Password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="new-password"
              hint={PASSWORD_HINT}
            />

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={registerForm.acceptTerms}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, acceptTerms: event.target.checked }))}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms-of-service" className="auth-inline-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="auth-inline-link">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={registerForm.acceptCommunications}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, acceptCommunications: event.target.checked }))
                }
              />
              <span>I agree to receive communications from Traviona Consulting</span>
            </label>

            <RecaptchaPlaceholder />

            <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
              {isSubmitting ? 'Creating account…' : 'Sign up'}
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to={`/login${nextPath !== '/' ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="auth-inline-link">
                Sign in
              </Link>
            </p>
          </form>
        </>
      ) : (
        <>
          <h1 className="auth-title">Welcome back!</h1>
          <p className="auth-subtitle">Please enter your details.</p>

          <div className="auth-social-grid">
            <GoogleSignInButton onError={setError} onClearNotice={() => setNotice('')} disabled={isSubmitting} />
            <LinkedInSignInButton onNotify={showFeatureNotice} disabled={isSubmitting} />
          </div>

          <AuthDivider label="Manual sign in" />

          {notice && <p className="auth-alert auth-alert-info">{notice}</p>}
          {error && <p className="auth-alert auth-alert-error">{error}</p>}
          {message && <p className="auth-alert auth-alert-success">{message}</p>}

          <form className="auth-form" onSubmit={handleLogin}>
            <AuthField
              id="login-email"
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
            />

            <PasswordField
              id="login-password"
              label="Password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="current-password"
            />

            <div className="auth-forgot-row">
              <button type="button" onClick={() => setShowReset(true)} className="auth-text-link">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="auth-switch">
              Don&apos;t have an account?{' '}
              <Link
                to={`/register${nextPath !== '/' ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
                className="auth-inline-link"
              >
                Sign up
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );

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
          {formContent}
        </section>
      </div>
    </div>
  );
}
