import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ServicePageTemplate from '../components/ServicePageTemplate.jsx';
import Header from '../components/Header.jsx';
import { fetchServiceBySlug } from '../lib/websiteApi.js';

export default function ServicePage() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchServiceBySlug(slug).then((result) => {
      if (isMounted) {
        setService(result);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="page-shell relative min-h-screen w-full max-w-full overflow-x-hidden bg-white text-ink">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-ink/60 sm:px-8">Loading service…</div>
      </main>
    );
  }

  if (!service) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page-shell relative min-h-screen w-full max-w-full overflow-x-hidden bg-white text-ink">
      <Header />
      <ServicePageTemplate service={service} />
    </main>
  );
}
