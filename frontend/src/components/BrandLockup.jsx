import Logo from './Logo.jsx';

const sizeStyles = {
  sm: {
    logo: 'h-14 max-w-[5.5rem] sm:h-16 sm:max-w-[6.25rem]',
    title: 'text-lg sm:text-xl',
    subtitle: 'text-[0.65rem] sm:text-xs',
  },
  md: {
    logo: 'h-[4.75rem] max-w-[7.5rem] sm:h-20 sm:max-w-[8.5rem]',
    title: 'text-2xl sm:text-3xl',
    subtitle: 'text-xs sm:text-sm',
  },
  lg: {
    logo: 'h-24 max-w-[9rem] sm:h-28 sm:max-w-[10.5rem]',
    title: 'text-3xl sm:text-4xl',
    subtitle: 'text-sm',
  },
};

export default function BrandLockup({
  size = 'md',
  theme = 'dark',
  showSubtitle = true,
  align = 'left',
  className = '',
}) {
  const styles = sizeStyles[size] || sizeStyles.md;
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}
    >
      <Logo
        variant="light"
        className={`${styles.logo} ${isDark ? '' : 'brightness-0'}`}
      />
      <p
        className={`mt-3 font-display font-bold leading-tight tracking-tight ${styles.title} ${
          isDark ? 'text-white' : 'text-ink'
        }`}
      >
        Traviona Consulting
      </p>
      {showSubtitle && (
        <p
          className={`mt-1 font-semibold uppercase tracking-[0.18em] ${styles.subtitle} ${
            isDark ? 'text-tide' : 'text-harbor'
          }`}
        >
          International Advisory
        </p>
      )}
    </div>
  );
}
