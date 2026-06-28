import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ScrollToHash from './components/ScrollToHash.jsx';
import AboutPage from './pages/AboutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import TalentNetworkPage from './pages/TalentNetworkPage.jsx';
import CareersPage from './pages/CareersPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import CookiePolicyPage from './pages/CookiePolicyPage.jsx';
import ServicePage from './pages/ServicePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

function AppLayout({ children, showFooter = true }) {
  return (
    <main className="page-shell relative min-h-screen w-full max-w-full overflow-x-hidden bg-white text-ink touch-pan-y">
      <Header />
      {children}
      {showFooter && <Footer />}
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        <Route
          path="/services/:slug"
          element={<ServicePage />}
        />
        <Route
          path="/about"
          element={
            <AppLayout showFooter={false}>
              <AboutPage />
            </AppLayout>
          }
        />
        <Route
          path="/insights"
          element={
            <AppLayout showFooter={false}>
              <InsightsPage />
            </AppLayout>
          }
        />
        <Route
          path="/talent-network"
          element={
            <AppLayout showFooter={false}>
              <TalentNetworkPage />
            </AppLayout>
          }
        />
        <Route
          path="/careers"
          element={
            <AppLayout showFooter={false}>
              <CareersPage />
            </AppLayout>
          }
        />
        <Route
          path="/careers/:slug"
          element={
            <AppLayout showFooter={false}>
              <JobDetailPage />
            </AppLayout>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route
          path="/contact"
          element={
            <AppLayout showFooter={false}>
              <ContactPage />
            </AppLayout>
          }
        />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
