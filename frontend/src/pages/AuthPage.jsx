import { ArrowLeft, BriefcaseBusiness, ChevronDown, Network, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLockup from '../components/BrandLockup.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { requestPasswordReset } from '../lib/authApi.js';

const roleOptions = [
  { value: 'Policy & Geopolitics', label: 'Policy & Geopolitics' },
  { value: 'Market Intelligence', label: 'Market Intelligence' },
  { value: 'Risk & Security', label: 'Risk & Security' },
  { value: 'Public Affairs', label: 'Public Affairs' },
  { value: 'Strategy Consulting', label: 'Strategy Consulting' },
  { value: 'Research & Analysis', label: 'Research & Analysis' },
];

const regionOptions = [
  { value: 'Africa', label: 'Africa' },
  { value: 'Americas', label: 'Americas' },
  { value: 'Asia-Pacific', label: 'Asia-Pacific' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Middle East', label: 'Middle East' },
  { value: 'Global / Remote', label: 'Global / Remote' },
];

const highlights = [
  { icon: BriefcaseBusiness, label: 'Career applications' },
  { icon: Network, label: 'Talent network access' },
  { icon: ShieldCheck, label: 'Secure member tools' },
];

function Field({ id, label, type = 'text', value, onChange, required = true, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-ink/50">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={label}
        className="w-full rounded-xl border border-ink/10 bg-ivory/50 px-4 py-3.5 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/40 focus:border-tide/40 focus:bg-white focus:ring-2"
      />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-ink/50">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required
        className="w-full appearance-none rounded-xl border border-ink/10 bg-ivory/50 px-4 py-3.5 pr-10 text-sm text-ink outline-none ring-tide/30 focus:border-tide/40 focus:bg-white focus:ring-2"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-[2.65rem] h-4 w-4 text-ink/45" aria-hidden="true" />
    </div>
  );
}

function SocialButton({ label, disabled = true }) {
  return (
    <button
      type="button"
      disabled={disabled}
      title="Social sign-in coming soon"
      className="inline-flex flex-1 items-center justify-center rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/55 shadow-sm disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

function AuthVisualPanel({ compact = false }) {
  return (
    <div
      className={`relative overflow-hidden bg-ink text-white ${
        compact ? 'min-h-[17rem]' : 'min-h-full lg:min-h-screen'
      }`}
    >
      <img
        src="/images/register1.avif"
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover ${compact ? 'object-[center_30%]' : 'object-center'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/88 to-ink/55 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/82 lg:to-ink/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(43,196,182,0.28),transparent_46%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div
        className={`relative z-10 flex h-full flex-col ${
          compact ? 'justify-end px-5 pb-8 pt-16' : 'justify-between px-8 py-10 xl:px-12 xl:py-12'
        }`}
      >
        {!compact && (
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur transition hover:border-tide hover:text-tide"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to site
          </Link>
        )}

        <div className={compact ? 'text-center' : 'max-w-md'}>
          <BrandLockup size={compact ? 'md' : 'lg'} theme="dark" align={compact ? 'center' : 'left'} />
          {!compact && (
            <>
              <p className="mt-6 text-base leading-7 text-white/78">
                Join Traviona&apos;s member platform for careers, expert network access, and advisory opportunities.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {highlights.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 backdrop-blur-sm"
                  >
                    <Icon className="h-3.5 w-3.5 text-tide" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {!compact && (
          <p className="hidden text-xs text-white/45 lg:block">Professional consulting &amp; global insights</p>
        )}
      </div>
    </div>
  );
}

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();
  const nextPath = searchParams.get('next') || '/';

  const [mode, setMode] = useState(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showReset, setShowReset] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
    region: '',
  });
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath]);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
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
    setIsSubmitting(true);

    const email = registerForm.email.trim().toLowerCase();
    const [firstName, ...rest] = registerForm.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ');

    try {
      await register({
        username: email,
        email,
        password: registerForm.password,
        first_name: firstName || '',
        last_name: lastName,
        location: registerForm.region,
        headline: registerForm.role,
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

  const heading =
    mode === 'register' ? 'Create your account' : showReset ? 'Reset your password' : 'Welcome back';

  const formContent = (
    <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_20px_50px_rgba(7,19,31,0.08)]">
      <div className="h-1.5 bg-gradient-to-r from-tide via-harbor to-midnight" aria-hidden="true" />

      <div className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-harbor">Member access</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-[2rem]">{heading}</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          {mode === 'register'
            ? 'Set up your Traviona profile to apply, collaborate, and stay connected.'
            : 'Sign in to manage applications and member tools.'}
        </p>

        {!showReset && (
          <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl bg-ivory p-1.5 ring-1 ring-ink/8">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                mode === 'login' ? 'bg-ink text-white shadow-sm' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                mode === 'register' ? 'bg-ink text-white shadow-sm' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mt-4 rounded-xl border border-tide/20 bg-tide/10 px-4 py-3 text-sm text-harbor">{message}</p>
        )}

        {showReset ? (
          <form className="mt-7 space-y-4" onSubmit={handleReset}>
            <Field
              id="reset-email"
              label="Email Address"
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="text-sm font-semibold text-harbor hover:text-ink"
            >
              Back to sign in
            </button>
          </form>
        ) : mode === 'login' ? (
          <form className="mt-7 space-y-4" onSubmit={handleLogin}>
            <Field
              id="login-email"
              label="Email Address"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
            />
            <Field
              id="login-password"
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-sm font-semibold text-harbor hover:text-ink"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SocialButton label="Google" />
              <SocialButton label="LinkedIn" />
            </div>
            <p className="text-center text-sm text-ink/60">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setMode('register')} className="font-semibold text-harbor hover:text-ink">
                Register
              </button>
            </p>
          </form>
        ) : (
          <form className="mt-7 space-y-4" onSubmit={handleRegister}>
            <Field
              id="register-name"
              label="Full Name"
              value={registerForm.fullName}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))}
              autoComplete="name"
            />
            <Field
              id="register-email"
              label="Work Email"
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
            />
            <Field
              id="register-password"
              label="Create Password"
              type="password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="new-password"
            />
            <SelectField
              id="register-role"
              label="Role / Expertise"
              value={registerForm.role}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, role: event.target.value }))}
              options={roleOptions}
            />
            <SelectField
              id="register-region"
              label="Region"
              value={registerForm.region}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, region: event.target.value }))}
              options={regionOptions}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SocialButton label="Google" />
              <SocialButton label="LinkedIn" />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-ink/60">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="font-semibold text-harbor hover:text-ink">
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[linear-gradient(160deg,#eef6f5_0%,#f8f6f1_45%,#ffffff_100%)] text-ink lg:bg-[linear-gradient(135deg,#eef6f5_0%,#ffffff_55%)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="lg:hidden">
          <AuthVisualPanel compact />
        </div>

        <aside className="relative hidden lg:sticky lg:top-0 lg:block lg:h-screen" aria-hidden="true">
          <AuthVisualPanel />
        </aside>

        <section className="flex items-center px-4 py-8 sm:px-8 lg:-mt-0 lg:px-10 lg:py-12 xl:px-14">
          <div className="mx-auto w-full max-w-lg">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-harbor transition hover:text-ink lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to site
            </Link>
            {formContent}
          </div>
        </section>
      </div>
    </div>
  );
}
