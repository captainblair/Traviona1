const variants = {
  /** White wordmark — footer, dark heroes */
  light: {
    src: '/images/logo-light.png',
    className: 'h-16 w-auto max-w-[7rem] sm:h-20 sm:max-w-[8.5rem] lg:max-w-[9.5rem]',
  },
  /** Fixed navbar — integer heights to avoid subpixel blur on mobile */
  header: {
    src: '/images/logo-light.png',
    className: 'h-14 w-auto max-w-[4.75rem] sm:h-16 sm:max-w-[5.5rem] lg:h-20 lg:max-w-[9.5rem]',
  },
  dark: {
    src: '/images/logo-light.png',
    className: 'h-16 w-auto max-w-[7rem] brightness-0 sm:h-20 sm:max-w-[8.5rem]',
  },
  /** Deep navy wordmark for light backgrounds */
  navy: {
    src: '/images/logo-dark.png',
    className: 'h-16 w-auto max-w-[8rem] sm:h-[4.5rem] sm:max-w-[9.5rem]',
  },
  mark: {
    src: '/images/logo-mark.png',
    className: 'h-11 w-auto max-w-[3rem] object-contain',
  },
  assistant: {
    src: '/images/logo-mark.png',
    className: 'h-8 w-8 object-contain',
  },
};

export default function Logo({ variant = 'light', className = '' }) {
  const config = variants[variant] || variants.light;

  return (
    <img
      src={config.src}
      alt="Traviona Consulting"
      decoding="sync"
      className={`block shrink-0 object-contain object-left ${config.className} ${className}`}
    />
  );
}
