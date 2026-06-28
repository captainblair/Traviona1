import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ScrollToHash from './components/ScrollToHash.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import RequireAdminAccess from './components/admin/RequireAdminAccess.jsx';
import AboutPage from './pages/AboutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import InsightDetailPage from './pages/InsightDetailPage.jsx';
import TalentNetworkPage from './pages/TalentNetworkPage.jsx';
import CareersPage from './pages/CareersPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import CookiePolicyPage from './pages/CookiePolicyPage.jsx';
import ServicePage from './pages/ServicePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminJobsPage from './pages/admin/AdminJobsPage.jsx';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage.jsx';
import AdminTalentsPage from './pages/admin/AdminTalentsPage.jsx';
import AdminInsightsPage from './pages/admin/AdminInsightsPage.jsx';
import AssistantWidget from './components/AssistantWidget.jsx';
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
          path="/insights/:slug"
          element={
            <AppLayout showFooter={false}>
              <InsightDetailPage />
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
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdminAccess>
              <AdminLayout />
            </RequireAdminAccess>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="talents" element={<AdminTalentsPage />} />
          <Route path="insights" element={<AdminInsightsPage />} />
        </Route>
        <Route
          path="/contact"
          element={
            <AppLayout showFooter={false}>
              <ContactPage />
            </AppLayout>
          }
        />
      </Routes>
      <AssistantWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}
