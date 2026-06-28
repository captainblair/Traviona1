import { useEffect, useRef, useState } from 'react';

import { useEffect, useRef, useState } from 'react';

export function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useReveal(delay = 0, motion = 'rise') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const motionClass = motion === 'fade' ? 'reveal--fade' : '';

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    className: visible ? `reveal is-visible ${motionClass}`.trim() : `reveal ${motionClass}`.trim(),
    style: { '--reveal-delay': `${delay}ms` },
  };
}

export function RevealSection({ children, className = '', delay = 0, motion = 'rise', ...props }) {
  const reveal = useReveal(delay, motion);
  return (
    <section ref={reveal.ref} className={`${reveal.className} ${className}`} style={reveal.style} {...props}>
      {children}
    </section>
  );
}

export function RevealItem({ children, className = '', delay = 0, motion = 'rise', as: Tag = 'div', ...props }) {
  const reveal = useReveal(delay, motion);
  return (
    <Tag ref={reveal.ref} className={`${reveal.className} ${className}`} style={reveal.style} {...props}>
      {children}
    </Tag>
  );
}
