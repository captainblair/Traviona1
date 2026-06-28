import { Navigate, useParams } from 'react-router-dom';
import ServicePageTemplate from '../components/ServicePageTemplate.jsx';
import Header from '../components/Header.jsx';
import { getServiceBySlug } from '../data/services.js';

export default function ServicePage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

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
