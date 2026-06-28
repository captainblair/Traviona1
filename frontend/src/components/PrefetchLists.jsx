import { useEffect } from 'react';
import { prefetchInsights } from '../lib/insightsApi.js';
import { prefetchJobs } from '../lib/jobsApi.js';

export default function PrefetchLists() {
  useEffect(() => {
    const run = () => {
      prefetchJobs();
      prefetchInsights();
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(run, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
